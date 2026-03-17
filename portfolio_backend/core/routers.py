import logging
from django.db import connections
from django.db.utils import OperationalError

logger = logging.getLogger(__name__)

class FallbackRouter:
    def db_for_read(self, model, **hints):
        """Attempts to read from 'default' (Neon 1), falls back to 'fallback' (Neon 2)."""
        try:
            # Check if default is alive
            connections['default'].ensure_connection()
            return 'default'
        except OperationalError:
            logger.warning("Primary Database is down or at limit! Switching to Fallback.")
            return 'fallback'

    def db_for_write(self, model, **hints):
        """Always try to write to default first to keep data consistent."""
        return 'default'

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return True