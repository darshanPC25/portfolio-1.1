# Database

PostgreSQL 17, run locally with `docker-compose.yml` in the project root.

The schema is owned by **Flyway** migrations in
`backend/src/main/resources/db/migration/`; nothing in this folder is executed. Hibernate
only validates the schema (`ddl-auto: validate`).

| Migration | Contents |
| --- | --- |
| `V1__create_schema.sql` | All tables, constraints and indexes |
| `V2__seed_initial_content.sql` | Initial draft content (the Batch 1 site copy) |

## Tables

| Area | Tables |
| --- | --- |
| Profile and hero | `portfolio_profile`, `hero_content`, `hero_focus_area` |
| About | `about_content`, `about_paragraph`, `about_fact`, `about_approach_step` |
| Sections | `portfolio_section`, `portfolio_section_setting` |
| Skills | `skill_category`, `skill` |
| Projects | `project`, `project_highlight`, `project_tag` |
| Journey, education, links | `experience`, `education`, `social_link` |
| Site settings | `portfolio_appearance`, `seo_settings` |
| Files | `portfolio_asset` |
| Contact | `contact_message` |
| Administrators | `admin_user` (no rows are created by migrations) |
| Publishing | `portfolio_publication` (append-only published snapshots) |

Conventions: UUID keys, `created_at` / `updated_at` audit timestamps, `version` for
optimistic locking, `display_order` + `visible` on list items, and single-row tables
enforced with `singleton_key = 1`.

## Useful commands

```bash
docker compose up -d                                   # start
docker compose down                                    # stop (data kept in a volume)
docker exec -it portfolio-postgres psql -U portfolio   # SQL shell
```
