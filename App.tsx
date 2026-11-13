import React, { useEffect, useState } from 'react';
import * as MarkdownModule from 'react-native-markdown-display';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { createMarkdownEditor, type MarkdownEditor } from './src/markdown-editor';
import type { Note } from './src/note-service';
import { createExpoMobileStorage } from './src/mobile/expo-storage';
import { createMobileNotesApp, type MobileNotesApp } from './src/mobile/notes-app';

const NativeMarkdown = (
  MarkdownModule as unknown as {
    default: React.ComponentType<{ children: string }>;
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
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | undefined>();

  const refreshNotes = async (searchQuery = query) => {
    try {
      setError(undefined);
      setNotes(searchQuery ? await app.search(searchQuery) : await app.listNotes());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load notes');
    }
  };

  useEffect(() => {
    void app.initialize().then(() => refreshNotes('')).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : 'Unable to initialize notes');
    });
  }, [app]);

  const openNote = async (noteId: string) => {
    const note = await app.openNote(noteId);
    if (note !== undefined) {
      setSelectedNote(note);
      setEditor(createMarkdownEditor(note.body));
    }
  };

  const createNewNote = async () => {
    const note = await app.createNote({ body: 'New note' });
    await refreshNotes();
    await openNote(note.id);
  };

  const saveNote = async () => {
    if (selectedNote === undefined || editor === undefined) {
      return;
    }

    const updatedNote = await app.updateNote(selectedNote.id, { body: editor.markdown });
    setSelectedNote(updatedNote);
    setEditor(createMarkdownEditor(updatedNote.body));
    await refreshNotes();
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>THREADNOTE</Text>
          <Text style={styles.title}>Your notes</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={createNewNote} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>New note</Text>
        </Pressable>
      </View>
      <TextInput
        accessibilityLabel="Search notes"
        onChangeText={(value) => {
          setQuery(value);
          void refreshNotes(value);
        }}
        placeholder="Search title or content"
        placeholderTextColor="#8b8f98"
        style={styles.search}
        value={query}
      />
      {error !== undefined && <Text style={styles.error}>{error}</Text>}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.noteList}>
          {notes.map((note) => (
            <Pressable key={note.id} onPress={() => void openNote(note.id)} style={styles.noteRow}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text numberOfLines={1} style={styles.notePreview}>{note.body}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.editorPanel}>
          {selectedNote !== undefined && editor !== undefined ? (
            <>
              <View style={styles.editorHeader}>
                <Text style={styles.panelTitle}>{selectedNote.title}</Text>
                <View style={styles.modeButtons}>
                  <Pressable onPress={() => setEditor(editor.setMode('edit'))} style={styles.modeButton}>
                    <Text style={styles.modeText}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => setEditor(editor.setMode('preview'))} style={styles.modeButton}>
                    <Text style={styles.modeText}>Preview</Text>
                  </Pressable>
                </View>
              </View>
              {editor.mode === 'edit' ? (
                <TextInput
                  multiline
                  onChangeText={(value) => setEditor(editor.setMarkdown(value))}
                  style={styles.editor}
                  textAlignVertical="top"
                  value={editor.markdown}
                />
              ) : (
                <ScrollView style={styles.preview}>
                  <NativeMarkdown>{editor.markdown}</NativeMarkdown>
                </ScrollView>
              )}
              <Pressable onPress={() => void saveNote()} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save note</Text>
              </Pressable>
            </>
          ) : (
            <Text style={styles.emptyState}>Select a note to open it</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f1ea' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  eyebrow: { color: '#b05a3c', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  title: { color: '#20252b', fontSize: 30, fontWeight: '700', marginTop: 4 },
  primaryButton: { backgroundColor: '#b05a3c', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11 },
  primaryButtonText: { color: '#fffaf4', fontWeight: '700' },
  search: { backgroundColor: '#fffaf4', borderColor: '#ded7ca', borderRadius: 8, borderWidth: 1, marginHorizontal: 20, padding: 13 },
  error: { color: '#a33b32', marginHorizontal: 20, marginTop: 8 },
  content: { flex: 1, padding: 20, gap: 16 },
  noteList: { gap: 8, paddingBottom: 20 },
  noteRow: { backgroundColor: '#fffaf4', borderRadius: 8, padding: 14 },
  noteTitle: { color: '#20252b', fontSize: 16, fontWeight: '700' },
  notePreview: { color: '#6f737b', marginTop: 5 },
  editorPanel: { backgroundColor: '#fffaf4', borderRadius: 8, flex: 1, padding: 16 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { color: '#20252b', fontSize: 18, fontWeight: '700' },
  modeButtons: { flexDirection: 'row', gap: 6 },
  modeButton: { borderColor: '#ded7ca', borderRadius: 6, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 6 },
  modeText: { color: '#b05a3c', fontSize: 12, fontWeight: '700' },
  editor: { color: '#20252b', flex: 1, fontSize: 16, lineHeight: 24, marginTop: 14 },
  preview: { flex: 1, marginTop: 14 },
  saveButton: { alignItems: 'center', backgroundColor: '#20252b', borderRadius: 8, marginTop: 12, padding: 13 },
  saveButtonText: { color: '#fffaf4', fontWeight: '700' },
  emptyState: { color: '#6f737b', marginTop: 20, textAlign: 'center' },
});
