import React, { useEffect, useState } from 'react';
import * as MarkdownModule from 'react-native-markdown-display';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createMarkdownEditor, getLinkSuggestions, type MarkdownEditor } from './src/markdown-editor';
import type { Note } from './src/note-service';
import { createExpoMobileStorage } from './src/mobile/expo-storage';
import { createMobileNotesApp, type MobileGraph, type MobileNotesApp } from './src/mobile/notes-app';

const NativeMarkdown = (
  MarkdownModule as unknown as {
    default: React.ComponentType<{
      children: string;
      onLinkPress?: (url: string) => boolean;
    }>;
  }
).default;

function useNotesApp(): MobileNotesApp {
  const [app] = useState(() => createMobileNotesApp(createExpoMobileStorage()));
  return app;
}

export default function App() {
  const app = useNotesApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [editor, setEditor] = useState<MarkdownEditor | undefined>();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [backlinks, setBacklinks] = useState<Note['backlinks']>([]);
  const [graph, setGraph] = useState<MobileGraph | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const refreshNotes = async (searchQuery = query, filterTag = tagFilter) => {
    try {
      setError(undefined);
      setNotes(searchQuery || filterTag
        ? await app.search(searchQuery, filterTag || undefined)
        : await app.listNotes());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load notes');
    }
  };

  useEffect(() => {
    void app.initialize().then(() => refreshNotes('', '')).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Unable to initialize notes');
    });
  }, [app]);

  const openNote = async (noteId: string) => {
    try {
      const note = await app.openNote(noteId);
      if (note === undefined) {
        return;
      }
      setSelectedNote(note);
      setTitle(note.title);
      setTags(note.tags.join(', '));
      setEditor(createMarkdownEditor(note.body));
      setBacklinks(await app.getBacklinks(note.id));
      setGraph(await app.getGraph(note.id));
      setStatus(undefined);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to open note');
    }
  };

  const createNewNote = async () => {
    const note = await app.createNote({ title: '', body: 'New note' });
    await refreshNotes();
    await openNote(note.id);
  };

  const saveNote = async () => {
    if (selectedNote === undefined || editor === undefined) {
      return;
    }

    try {
      const updatedNote = await app.updateNote(selectedNote.id, {
        title,
        body: editor.markdown,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });
      const links = editor.markdown.match(/\[\[([^\[\]]+)\]\]/g) ?? [];
      for (const link of links) {
        await app.resolveLink(updatedNote.id, link.slice(2, -2).trim());
      }
      setSelectedNote(updatedNote);
      setEditor(createMarkdownEditor(updatedNote.body));
      setBacklinks(await app.getBacklinks(updatedNote.id));
      setGraph(await app.getGraph(updatedNote.id));
      await refreshNotes();
      setStatus('Saved locally');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to save note');
    }
  };

  const deleteSelectedNote = () => {
    if (selectedNote === undefined) {
      return;
    }
    Alert.alert('Delete note?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => void (async () => {
          await app.deleteNote(selectedNote.id);
          setSelectedNote(undefined);
          setEditor(undefined);
          await refreshNotes();
          setStatus('Note deleted');
        })(),
      },
    ]);
  };

  const openLink = async (url: string): Promise<boolean> => {
    if (selectedNote === undefined || !url.startsWith('threadnote://note/')) {
      return true;
    }
    const titleFromUrl = decodeURIComponent(url.slice('threadnote://note/'.length));
    const target = await app.resolveLink(selectedNote.id, titleFromUrl);
    await openNote(target.id);
    return false;
  };

  const applySuggestion = (suggestion: string) => {
    if (editor === undefined) {
      return;
    }
    const openingIndex = editor.markdown.lastIndexOf('[[');
    const nextMarkdown = `${editor.markdown.slice(0, openingIndex + 2)}${suggestion}`;
    setEditor(editor.setMarkdown(nextMarkdown));
  };

  const exportBackup = async () => {
    await app.exportBackup();
    setStatus('Backup exported to app storage');
  };

  const importBackup = async () => {
    try {
      await app.importBackup();
      await refreshNotes();
      setStatus('Backup restored');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No valid backup found');
    }
  };

  const suggestions = editor === undefined
    ? []
    : getLinkSuggestions(editor.markdown, notes.map((note) => note.title));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>THREADNOTE</Text>
            <Text style={styles.title}>Your notes</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void createNewNote()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>New note</Text>
          </Pressable>
        </View>
        <View style={styles.toolbar}>
          <TextInput
            accessibilityLabel="Search notes"
            onChangeText={(value) => {
              setQuery(value);
              void refreshNotes(value, tagFilter);
            }}
            placeholder="Search title or content"
            placeholderTextColor="#8b8f98"
            style={styles.search}
            value={query}
          />
          <TextInput
            accessibilityLabel="Filter by tag"
            onChangeText={(value) => {
              setTagFilter(value);
              void refreshNotes(query, value);
            }}
            placeholder="Tag"
            placeholderTextColor="#8b8f98"
            style={styles.tagFilter}
            value={tagFilter}
          />
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => void exportBackup()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Export</Text></Pressable>
          <Pressable onPress={() => void importBackup()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Import</Text></Pressable>
        </View>
        {error !== undefined && <Text style={styles.error}>{error}</Text>}
        {status !== undefined && <Text style={styles.status}>{status}</Text>}
        <View style={styles.content}>
          <View style={styles.noteList}>
            {notes.map((note) => (
              <Pressable key={note.id} onPress={() => void openNote(note.id)} style={styles.noteRow}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text numberOfLines={1} style={styles.notePreview}>{note.body}</Text>
                {note.tags.length > 0 && <Text style={styles.noteTags}>{note.tags.join('  ')}</Text>}
              </Pressable>
            ))}
          </View>
          <View style={styles.editorPanel}>
            {selectedNote !== undefined && editor !== undefined ? (
              <>
                <TextInput onChangeText={setTitle} placeholder="Note title" style={styles.titleInput} value={title} />
                <TextInput onChangeText={setTags} placeholder="Tags, comma separated" style={styles.tagsInput} value={tags} />
                <View style={styles.editorHeader}>
                  <Text style={styles.panelTitle}>{editor.mode === 'edit' ? 'Edit note' : 'Preview'}</Text>
                  <View style={styles.modeButtons}>
                    <Pressable onPress={() => setEditor(editor.setMode('edit'))} style={styles.modeButton}><Text style={styles.modeText}>Edit</Text></Pressable>
                    <Pressable onPress={() => setEditor(editor.setMode('preview'))} style={styles.modeButton}><Text style={styles.modeText}>Preview</Text></Pressable>
                  </View>
                </View>
                {editor.mode === 'edit' ? (
                  <TextInput multiline onChangeText={(value) => setEditor(editor.setMarkdown(value))} style={styles.editor} textAlignVertical="top" value={editor.markdown} />
                ) : (
                  <View style={styles.preview}>
                    <NativeMarkdown onLinkPress={(url) => { void openLink(url); return false; }}>{editor.markdown}</NativeMarkdown>
                  </View>
                )}
                {suggestions.length > 0 && (
                  <View style={styles.suggestions}>
                    <Text style={styles.sectionLabel}>Link suggestions</Text>
                    {suggestions.map((suggestion) => <Pressable key={suggestion} onPress={() => applySuggestion(suggestion)}><Text style={styles.suggestion}>{suggestion}</Text></Pressable>)}
                  </View>
                )}
                <View style={styles.buttonRow}>
                  <Pressable onPress={() => void saveNote()} style={styles.saveButton}><Text style={styles.saveButtonText}>Save note</Text></Pressable>
                  <Pressable onPress={deleteSelectedNote} style={styles.deleteButton}><Text style={styles.deleteText}>Delete</Text></Pressable>
                </View>
                <Text style={styles.sectionLabel}>Backlinks</Text>
                {backlinks.length === 0 ? <Text style={styles.muted}>No backlinks yet</Text> : backlinks.map((backlink) => <Pressable key={backlink.id} onPress={() => void openNote(backlink.id)}><Text style={styles.linkRow}>{backlink.title}  {backlink.linkText}</Text></Pressable>)}
                {graph !== undefined && <>
                  <Text style={styles.sectionLabel}>Knowledge graph</Text>
                  <Text style={styles.muted}>{graph.nodes.length} nodes, {graph.edges.length} links</Text>
                  {graph.nodes.map((node) => <Text key={node.id} style={styles.graphNode}>{node.id === graph.center ? '● ' : '○ '}{node.title}</Text>)}
                  {graph.edges.map((edge) => <Text key={`${edge.source}-${edge.target}`} style={styles.graphEdge}>{edge.source.slice(-6)} → {edge.target.slice(-6)}</Text>)}
                </>}
              </>
            ) : <Text style={styles.emptyState}>Select a note to open it</Text>}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f1ea' },
  page: { paddingBottom: 28 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  eyebrow: { color: '#b05a3c', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#20252b', fontSize: 30, fontWeight: '700', marginTop: 4 },
  primaryButton: { backgroundColor: '#b05a3c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  primaryButtonText: { color: '#fffaf4', fontWeight: '700' },
  toolbar: { flexDirection: 'row', gap: 8, marginHorizontal: 20 },
  search: { backgroundColor: '#fffaf4', borderColor: '#ded7ca', borderRadius: 8, borderWidth: 1, flex: 1, padding: 13 },
  tagFilter: { backgroundColor: '#fffaf4', borderColor: '#ded7ca', borderRadius: 8, borderWidth: 1, padding: 13, width: 92 },
  actions: { flexDirection: 'row', gap: 8, marginHorizontal: 20, marginTop: 10 },
  secondaryButton: { borderColor: '#b05a3c', borderRadius: 7, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  secondaryText: { color: '#b05a3c', fontWeight: '700' },
  error: { color: '#a33b32', marginHorizontal: 20, marginTop: 8 },
  status: { color: '#356b57', marginHorizontal: 20, marginTop: 8 },
  content: { gap: 16, padding: 20 },
  noteList: { gap: 8 },
  noteRow: { backgroundColor: '#fffaf4', borderRadius: 8, padding: 14 },
  noteTitle: { color: '#20252b', fontSize: 16, fontWeight: '700' },
  notePreview: { color: '#6f737b', marginTop: 5 },
  noteTags: { color: '#b05a3c', fontSize: 12, marginTop: 7 },
  editorPanel: { backgroundColor: '#fffaf4', borderRadius: 8, minHeight: 470, padding: 16 },
  titleInput: { borderBottomColor: '#ded7ca', borderBottomWidth: 1, color: '#20252b', fontSize: 20, fontWeight: '700', paddingVertical: 8 },
  tagsInput: { color: '#b05a3c', fontSize: 13, paddingVertical: 8 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: '#20252b', fontSize: 16, fontWeight: '700' },
  modeButtons: { flexDirection: 'row', gap: 6 },
  modeButton: { borderColor: '#ded7ca', borderRadius: 6, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  modeText: { color: '#b05a3c', fontSize: 12, fontWeight: '700' },
  editor: { color: '#20252b', minHeight: 170, paddingVertical: 14, fontSize: 16, lineHeight: 24 },
  preview: { minHeight: 170, paddingVertical: 12 },
  suggestions: { backgroundColor: '#f4f1ea', borderRadius: 6, marginTop: 8, padding: 10 },
  sectionLabel: { color: '#6f737b', fontSize: 12, fontWeight: '700', marginTop: 14, textTransform: 'uppercase' },
  suggestion: { color: '#b05a3c', paddingVertical: 5 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  saveButton: { alignItems: 'center', backgroundColor: '#20252b', borderRadius: 8, flex: 1, padding: 13 },
  saveButtonText: { color: '#fffaf4', fontWeight: '700' },
  deleteButton: { alignItems: 'center', borderColor: '#a33b32', borderRadius: 8, borderWidth: 1, padding: 13 },
  deleteText: { color: '#a33b32', fontWeight: '700' },
  muted: { color: '#8b8f98', marginTop: 5 },
  linkRow: { color: '#b05a3c', marginTop: 5 },
  graphNode: { color: '#20252b', marginTop: 5 },
  graphEdge: { color: '#6f737b', fontSize: 12, marginTop: 3 },
  emptyState: { color: '#6f737b', marginTop: 20, textAlign: 'center' },
});
