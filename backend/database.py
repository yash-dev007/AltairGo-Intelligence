from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

import os

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BACKEND_DIR, 'travel.db')

# DATABASE CONFIGURATION
# 1. Look for 'DATABASE_URL' in environment (Production/Render/Railway)
# 2. Fallback to local SQLite file
database_url = os.environ.get('DATABASE_URL')

if database_url and database_url.startswith("postgres://"):
    # Fix Render's postgres:// -> postgresql:// for SQLAlchemy
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if not database_url:
    database_url = f'sqlite:///{DB_PATH}'

engine = create_engine(database_url)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # Import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    import models
    Base.metadata.create_all(bind=engine)
