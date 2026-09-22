from django.db import migrations

def enable_rls(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor != 'postgresql':
        # Row-level security is a PostgreSQL feature. Skip on non-PostgreSQL DBs (e.g. SQLite in test).
        return

    tables = [
        'portfolio_project',
        'portfolio_projectimage',
        'portfolio_projectexplanation',
        'portfolio_contactmessage',
        'portfolio_skill',
        'portfolio_experience',
        'portfolio_about',
        'portfolio_sociallink',
        'portfolio_chatcache',
        'portfolio_sectionanalytics',
        'portfolio_collaborationinquiry',
    ]

    sql_statements = []

    # Enable RLS on all tables
    for table in tables:
        sql_statements.append(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;")

    # Define RLS policies
    policies = [
        # Public READ policies for portfolio showcase tables
        ("portfolio_project_read", "portfolio_project", "FOR SELECT USING (true)"),
        ("portfolio_projectimage_read", "portfolio_projectimage", "FOR SELECT USING (true)"),
        ("portfolio_projectexplanation_read", "portfolio_projectexplanation", "FOR SELECT USING (true)"),
        ("portfolio_skill_read", "portfolio_skill", "FOR SELECT USING (true)"),
        ("portfolio_experience_read", "portfolio_experience", "FOR SELECT USING (true)"),
        ("portfolio_about_read", "portfolio_about", "FOR SELECT USING (true)"),
        ("portfolio_sociallink_read", "portfolio_sociallink", "FOR SELECT USING (true)"),
        
        # INSERT-only policies for public submission tables (prevents reading or modifying existing inquiries/messages)
        ("portfolio_contactmessage_insert", "portfolio_contactmessage", "FOR INSERT WITH CHECK (true)"),
        ("portfolio_collaborationinquiry_insert", "portfolio_collaborationinquiry", "FOR INSERT WITH CHECK (true)"),
        ("portfolio_sectionanalytics_insert", "portfolio_sectionanalytics", "FOR INSERT WITH CHECK (true)"),
        ("portfolio_sectionanalytics_select", "portfolio_sectionanalytics", "FOR SELECT USING (true)"),
        ("portfolio_chatcache_select", "portfolio_chatcache", "FOR SELECT USING (true)"),
        ("portfolio_chatcache_insert", "portfolio_chatcache", "FOR INSERT WITH CHECK (true)"),
    ]

    for policy_name, table_name, rule in policies:
        sql_statements.append(f"""
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies WHERE policyname = '{policy_name}' AND tablename = '{table_name}'
                ) THEN
                    CREATE POLICY {policy_name} ON {table_name} {rule};
                END IF;
            END $$;
        """)

    with schema_editor.connection.cursor() as cursor:
        for stmt in sql_statements:
            cursor.execute(stmt)


def disable_rls(apps, schema_editor):
    vendor = schema_editor.connection.vendor
    if vendor != 'postgresql':
        return

    tables = [
        'portfolio_project',
        'portfolio_projectimage',
        'portfolio_projectexplanation',
        'portfolio_contactmessage',
        'portfolio_skill',
        'portfolio_experience',
        'portfolio_about',
        'portfolio_sociallink',
        'portfolio_chatcache',
        'portfolio_sectionanalytics',
        'portfolio_collaborationinquiry',
    ]

    with schema_editor.connection.cursor() as cursor:
        for table in tables:
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;")


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0009_collaborationinquiry'),
    ]

    operations = [
        migrations.RunPython(enable_rls, reverse_code=disable_rls),
    ]
