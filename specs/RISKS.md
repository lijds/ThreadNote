# ThreadNote v1 Risk Register

| ID | Risk | Severity | Symptoms and Consequences | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| **R-01** | Misinterpretation of requirements by the agent | High | Code is generated in violation of architectural constraints. | Strictly document rules in prompts and rely on Acceptance Criteria. |
| **R-02** | Correlation of errors between code and tests | Critical | The agent writes incorrect code and simultaneously creates tests that "confirm" it. | Independently audit test scenarios and add custom edge-case tests. |
| **R-03** | Knowledge graph performance issues (`NFR-03`) | High | The interface becomes unresponsive when the 500-note limit is reached. | Run load tests early with mock data. |
| **R-04** | Reviewer fatigue | High | A person performs a superficial review of generated code because of the agent's high delivery speed. | Work in small tasks and enforce strict gate controls. |