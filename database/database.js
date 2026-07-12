import Database from "better-sqlite3";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = "./database/website.db";

let dbInstance = null;

export async function getDb()
{
    if(!dbInstance)
    {
        dbInstance = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
    }
    return dbInstance;
}

export async function createAllTables() {
    const db = await getDb();
    
    // ✅ Users table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullName TEXT NOT NULL,
            phone TEXT,
            email TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'student',
            grade TEXT,
            field TEXT,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // ✅ PDF Exams table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS pdf_exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT DEFAULT 'قلم چی',
            subject TEXT NOT NULL,
            grade TEXT NOT NULL,
            year INTEGER NOT NULL,
            title TEXT NOT NULL,
            pdf_path TEXT NOT NULL,
            answer_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ All database tables created/verified!');
}