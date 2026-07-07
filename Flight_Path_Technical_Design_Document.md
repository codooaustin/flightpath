# Flight Path

# Technical Design Document

## Overview

This document defines the technical architecture for Flight Path, a web
application designed to guide a student pilot from initial aviation
interest through professional airline certification.

Technology stack:

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Supabase
-   PostgreSQL
-   Supabase Storage
-   Vercel

------------------------------------------------------------------------

# System Architecture

## High-Level Architecture

    User Browser
         |
         |
    Next.js Application
         |
         |
    Supabase Backend
         |
         |
    PostgreSQL Database
         |
         |
    Supabase Storage

------------------------------------------------------------------------

# Application Structure

Recommended Next.js structure:

    flight-path/

    app/
    ├── dashboard/
    ├── roadmap/
    ├── missions/
    ├── flights/
    ├── certifications/
    ├── ground-school/
    ├── calendar/
    ├── costs/
    ├── scholarships/
    ├── hangar/
    ├── journal/
    ├── resources/
    ├── settings/
    └── api/

    components/

    ├── dashboard/
    ├── roadmap/
    ├── missions/
    ├── flights/
    ├── charts/
    ├── forms/
    └── ui/

    lib/

    ├── supabase/
    ├── auth/
    ├── calculations/
    └── utilities/

    types/

    ├── database.ts
    └── models.ts

------------------------------------------------------------------------

# Authentication Design

## Provider

Supabase Auth

Supported methods:

-   Email/password
-   Google OAuth (future)

------------------------------------------------------------------------

# User Roles

## Student

Primary account owner.

Permissions:

-   Create flights
-   Complete missions
-   Upload documents
-   Add journal entries
-   Manage expenses

------------------------------------------------------------------------

## Parent

Support account.

Permissions:

-   View student progress
-   Add notes
-   View expenses
-   Upload documents
-   Manage calendar items

------------------------------------------------------------------------

# Database Design

## Users Table

    users

    id UUID PRIMARY KEY

    email TEXT

    name TEXT

    role TEXT

    avatar_url TEXT

    created_at TIMESTAMP

------------------------------------------------------------------------

# Profile Table

Stores aviation-specific information.

    profiles

    id UUID PRIMARY KEY

    user_id UUID

    birth_date DATE

    target_airline TEXT

    career_goal TEXT

    home_airport TEXT

    created_at TIMESTAMP

------------------------------------------------------------------------

# Roadmap Tables

## Stages

Stores career stages.

    stages

    id UUID

    name TEXT

    description TEXT

    order_number INTEGER

Example:

-   Explorer
-   Student Pilot
-   Private Pilot
-   Commercial Pilot

------------------------------------------------------------------------

## Missions

    missions

    id UUID

    stage_id UUID

    title TEXT

    description TEXT

    estimated_cost DECIMAL

    estimated_duration TEXT

    order_number INTEGER

------------------------------------------------------------------------

## User Missions

Tracks progress.

    user_missions

    id UUID

    user_id UUID

    mission_id UUID

    status TEXT

    completion_date DATE

    notes TEXT

Status:

-   Locked
-   Available
-   In Progress
-   Completed

------------------------------------------------------------------------

# Flight Logbook

## Flights

    flights

    id UUID

    user_id UUID

    date DATE

    aircraft TEXT

    tail_number TEXT

    departure_airport TEXT

    arrival_airport TEXT

    instructor TEXT

    flight_time DECIMAL

    pic_time DECIMAL

    dual_time DECIMAL

    cross_country_time DECIMAL

    night_time DECIMAL

    instrument_time DECIMAL

    landings INTEGER

    notes TEXT

    created_at TIMESTAMP

------------------------------------------------------------------------

## Flight Photos

    flight_media

    id UUID

    flight_id UUID

    file_url TEXT

    caption TEXT

------------------------------------------------------------------------

# Certifications

## Certificates

    certificates

    id UUID

    user_id UUID

    type TEXT

    status TEXT

    issued_date DATE

    expiration_date DATE

    document_url TEXT

    notes TEXT

Types:

-   Student Pilot
-   Medical
-   Private Pilot
-   Instrument
-   Commercial
-   CFI
-   ATP

------------------------------------------------------------------------

# Ground School

## Courses

    courses

    id UUID

    name TEXT

    provider TEXT

    description TEXT

------------------------------------------------------------------------

## Lessons

    lessons

    id UUID

    course_id UUID

    title TEXT

    category TEXT

    order_number INTEGER

------------------------------------------------------------------------

## Student Progress

    lesson_progress

    id UUID

    user_id UUID

    lesson_id UUID

    completed BOOLEAN

    score INTEGER

    notes TEXT

------------------------------------------------------------------------

# Calendar

## Events

    calendar_events

    id UUID

    user_id UUID

    title TEXT

    type TEXT

    start_date TIMESTAMP

    end_date TIMESTAMP

    description TEXT

    completed BOOLEAN

Event types:

-   Flight
-   Study
-   Test
-   Medical
-   Checkride
-   Scholarship

------------------------------------------------------------------------

# Expense Management

## Expenses

    expenses

    id UUID

    user_id UUID

    category TEXT

    description TEXT

    amount DECIMAL

    date DATE

    receipt_url TEXT

Categories:

-   Flight Training
-   Books
-   Equipment
-   Medical
-   Tests
-   Travel

------------------------------------------------------------------------

# Scholarships

## Scholarships

    scholarships

    id UUID

    name TEXT

    organization TEXT

    amount DECIMAL

    deadline DATE

    eligibility TEXT

    url TEXT

------------------------------------------------------------------------

## Student Applications

    scholarship_applications

    id UUID

    user_id UUID

    scholarship_id UUID

    status TEXT

    notes TEXT

------------------------------------------------------------------------

# Hangar Storage

## Files

    files

    id UUID

    user_id UUID

    category TEXT

    file_url TEXT

    description TEXT

    created_at TIMESTAMP

Categories:

-   Certificates
-   Photos
-   Aircraft
-   Equipment
-   Documents

------------------------------------------------------------------------

# Journal

## Journal Entries

    journal_entries

    id UUID

    user_id UUID

    title TEXT

    content TEXT

    entry_date DATE

    mission_id UUID

------------------------------------------------------------------------

# Achievement System

## Achievements

    achievements

    id UUID

    name TEXT

    description TEXT

    icon TEXT

------------------------------------------------------------------------

## User Achievements

    user_achievements

    id UUID

    user_id UUID

    achievement_id UUID

    earned_date DATE

------------------------------------------------------------------------

# Storage Strategy

Use Supabase Storage buckets.

Buckets:

    documents

    photos

    videos

    receipts

    certificates

Storage rules:

-   Student owns data
-   Parent access through relationship permissions

------------------------------------------------------------------------

# Row Level Security

All tables should use Supabase RLS.

Example:

Users can only view their own records.

Parents can view linked student records.

------------------------------------------------------------------------

# API Design

Use Next.js Server Actions or Route Handlers.

Examples:

    GET /api/flights

    POST /api/flights

    GET /api/progress

    GET /api/cost-summary

    POST /api/journal

------------------------------------------------------------------------

# Core Calculations

## Progress Percentage

Calculated from:

Completed missions / Total missions

------------------------------------------------------------------------

## Flight Progress

Calculate:

-   Total hours
-   Remaining hours
-   Certificate readiness

------------------------------------------------------------------------

## Cost Forecast

Calculate:

Actual spent + estimated remaining milestones

------------------------------------------------------------------------

# UI Architecture

## Component Library

Use:

-   shadcn/ui
-   Radix UI
-   Lucide icons

Components:

-   Cards
-   Progress bars
-   Timeline
-   Calendar
-   Data tables
-   Forms
-   Dialogs

------------------------------------------------------------------------

# Dashboard Components

Required:

-   Progress card
-   Current mission
-   Flight statistics
-   Upcoming events
-   Recent achievements
-   Cost summary

------------------------------------------------------------------------

# Deployment

## Hosting

Vercel

## Environment Variables

    NEXT_PUBLIC_SUPABASE_URL

    NEXT_PUBLIC_SUPABASE_ANON_KEY

    SUPABASE_SERVICE_ROLE_KEY

------------------------------------------------------------------------

# Development Roadmap

## Phase 1

Foundation:

-   Authentication
-   Database
-   Dashboard
-   Roadmap
-   Missions

------------------------------------------------------------------------

## Phase 2

Training:

-   Flight logbook
-   Ground school
-   Certifications
-   Calendar

------------------------------------------------------------------------

## Phase 3

Portfolio:

-   Photos
-   Journal
-   Achievements
-   Scholarships

------------------------------------------------------------------------

## Phase 4

Intelligence:

-   AI coach
-   Recommendations
-   Career planning

------------------------------------------------------------------------

# Security Requirements

-   Enable RLS
-   Validate uploads
-   Limit file sizes
-   Encrypt sensitive information
-   Use secure authentication
-   Maintain audit history for certifications

------------------------------------------------------------------------

# Future Integrations

Potential integrations:

-   ForeFlight
-   FAA databases
-   Weather APIs
-   Calendar providers
-   Flight school systems

------------------------------------------------------------------------

# Technical Success Criteria

The system should:

-   Scale for years of aviation history
-   Support mobile and desktop
-   Preserve all aviation records
-   Provide reliable progress tracking
-   Remain maintainable through the student's entire pilot journey
