# Prompt Refinement / User Story Generation

## 1. Analyze first

Read the requirement, relevant Jira context, repository/docs, dependencies, and existing architecture. Do not create/modify Jira decomposition yet.

## 2. Material ambiguity gate

Ask only questions whose answers materially change product behavior, architecture, Story boundaries, AC, dependency/order, or irreversible decisions. Do not ask what repo/Jira inspection can answer.

## 3. Propose exact decomposition

Use an existing Epic when the human supplies one; otherwise default to one Epic for one coherent initiative. For each Story include value/intent, scope, out of scope, AC, dependencies/order, relevant areas, risks/assumptions, recommended Agent/Model/Planned effort, and rationale. Recommendations are descriptive only.

Challenge the decomposition: independently reviewable? small enough for one invocation? real dependencies? duplicated requirement? hidden human decision?

## 4. Human approval gate

State that no Jira decomposition has been written. Create only after explicit human approval. After approval create exactly what was approved. New information that materially changes decomposition -> STOP and re-approve.

## 5. Jira creation

Preserve provenance. Create AC as real ADF taskItems initialized TODO. Do not populate human-owned implementation gate fields. If an existing Epic was supplied, create approved Stories under it and do not create another Epic.

Never move generated Stories to `Ready to Develop`; that remains a separate human gate.
