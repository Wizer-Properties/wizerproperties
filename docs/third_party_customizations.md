### Third-Party Customizations Log

This section documents all modifications made to third-party packages within this project. Each entry includes the package name, the specific files modified, the reason for the change, and a description of the modification. This ensures that customizations are tracked, preserved across updates, and easily understood by all team members.

#### Customization Log Entries

**Django**
- **File:** wizerproperties/templates/admin/index.html
  - **Reason:** None
  - **Modification:** Nothing changes only override the file.

**Postgresql**
- **File:** user/migrations/0001_initial.py
  - **Reason:** For make email case insensitive
  - **Modification:** In operations list added new operation **CreateCollation**.
