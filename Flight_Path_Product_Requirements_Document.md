# Flight Path

## Product Requirements Document (PRD)

**Version:** 1.0\
**Status:** Draft\
**Product Owner:** Parent + Student Pilot\
**Primary User:** Aspiring professional pilot

## Product Overview

Flight Path is a personal aviation career companion designed to guide a
student from their first aviation experience through becoming a
professional airline pilot.

The application transforms a long-term aviation goal into a structured
journey consisting of:

-   Career milestones
-   Training objectives
-   Flight logging
-   Certifications
-   Costs
-   Calendar planning
-   Personal memories
-   Documents
-   Scholarships
-   Career preparation

The app should feel like a personal aviation mentor rather than a task
management system.

# Product Goals

## Primary Goals

1.  Keep the student motivated toward becoming a professional pilot.
2.  Clearly communicate the next recommended action.
3.  Track progress against pilot requirements.
4.  Create a lifelong aviation portfolio.
5.  Help parents support the student's journey.
6.  Track financial investment and future costs.
7.  Preserve memories throughout the journey.

# Users

## Student Pilot

Capabilities:

-   View aviation roadmap
-   Complete missions
-   Log flights
-   Track certifications
-   Upload photos
-   Maintain journal
-   Track expenses
-   Manage calendar
-   Apply for scholarships

## Parent / Mentor

Capabilities:

-   View progress
-   Add notes
-   Track costs
-   Help manage milestones
-   Upload documents
-   Add events
-   Encourage progress

# Core User Experience Principles

## Show the Path

The user should always understand:

-   Where they are
-   What they completed
-   What comes next

## Celebrate Progress

Every major accomplishment should feel meaningful:

-   First discovery flight
-   First solo
-   Private Pilot Certificate
-   Instrument Rating
-   Commercial Certificate
-   First airline job

## Capture Memories

The application should preserve:

-   Photos
-   Videos
-   Journal entries
-   Certificates
-   Flight history
-   Personal reflections

# Application Structure

-   Dashboard
-   Career Roadmap
-   Missions
-   Flight Logbook
-   Certifications
-   Ground School
-   Calendar
-   Costs
-   Scholarships
-   Hangar
-   Journal
-   Resources
-   Settings

# Dashboard

The dashboard provides immediate awareness of progress.

Components:

-   Current stage
-   Overall progress
-   Flight statistics
-   Upcoming events
-   Recent achievements
-   Next mission

# Career Roadmap

The roadmap visualizes the complete pilot journey.

Stages:

1.  Explorer
2.  Student Aviator
3.  Student Pilot
4.  Private Pilot
5.  Instrument Pilot
6.  Commercial Pilot
7.  Flight Instructor
8.  Professional Pilot
9.  Regional Airline Pilot
10. Major Airline Captain

# Mission System

The application is organized around missions instead of simple tasks.

Each mission contains:

-   Title
-   Description
-   Why it matters
-   Requirements
-   Estimated cost
-   Estimated duration
-   Resources
-   Checklist
-   Progress percentage
-   Attachments
-   Notes

Example mission:

## Earn Private Pilot Certificate

Requirements:

-   Complete ground school
-   Pass FAA written exam
-   Complete required flight hours
-   Complete solo flight
-   Complete cross-country requirements
-   Pass checkride

# Milestones

Examples:

-   Discovery Flight
-   First Solo Flight
-   Private Pilot Certificate
-   Instrument Rating
-   Commercial Certificate
-   Flight Instructor Certificate
-   Airline Transport Pilot

Each milestone stores:

-   Completion date
-   Photos
-   Documents
-   Journal entries
-   Notes

# Flight Logbook

Maintain a complete digital flight history.

Flight entry fields:

-   Date
-   Aircraft
-   Tail number
-   Flight school
-   Instructor
-   Departure airport
-   Arrival airport
-   Flight time
-   PIC time
-   Dual received
-   Cross-country time
-   Night time
-   Instrument time
-   Landings
-   Notes
-   Photos

# Certifications

Track:

-   Student Pilot Certificate
-   Medical Certificate
-   Private Pilot Certificate
-   Instrument Rating
-   Commercial Pilot Certificate
-   CFI
-   ATP

Each certification includes:

-   Status
-   Requirements
-   Documents
-   Dates
-   Expiration
-   Notes

# Ground School

Track aviation education progress.

Subjects:

-   Aerodynamics
-   Weather
-   Airspace
-   Navigation
-   Regulations
-   Aircraft systems

Track:

-   Progress percentage
-   Practice scores
-   Weak areas
-   Notes

# Calendar

Event types:

-   Flight lesson
-   Exam
-   Checkride
-   Medical appointment
-   Study session
-   Scholarship deadline
-   Aviation event

Features:

-   Monthly view
-   Timeline view
-   Completed events
-   Notes and attachments

# Cost Management

Track financial investment.

Categories:

-   Flight lessons
-   Aircraft rental
-   Instructor fees
-   Ground school
-   Books
-   Headset
-   Simulator
-   Medical exams
-   Written tests
-   Checkrides
-   Travel

Display:

-   Budget
-   Actual spending
-   Remaining cost
-   Projected future cost

# Scholarship Tracker

Fields:

-   Name
-   Organization
-   Amount
-   Deadline
-   Eligibility
-   Application status
-   Requirements
-   Documents
-   Notes

# Hangar

Digital aviation storage area.

Store:

-   Certificates
-   Photos
-   Videos
-   Aircraft information
-   Equipment
-   Documents

# Journal

Capture personal growth.

Entries include:

-   Date
-   Title
-   Text
-   Photos
-   Video
-   Related mission
-   Flight reference

# Achievement System

Examples:

-   First Flight
-   First Solo
-   100 Landings
-   Private Pilot
-   Instrument Rated
-   Commercial Pilot
-   100 Hours
-   500 Hours
-   1000 Hours
-   ATP Eligible

# Parent Dashboard

Features:

-   Progress overview
-   Upcoming milestones
-   Expenses
-   Documents
-   Calendar
-   Notes

# Database Design

## Users

Fields:

-   id
-   name
-   email
-   role
-   created_at

## Missions

Fields:

-   id
-   title
-   description
-   stage
-   estimated_cost
-   estimated_duration
-   order

## User Missions

Fields:

-   id
-   user_id
-   mission_id
-   status
-   completion_date
-   notes

## Flights

Fields:

-   id
-   user_id
-   date
-   aircraft
-   tail_number
-   duration
-   pic_time
-   dual_time
-   cross_country
-   night
-   instrument
-   notes

## Expenses

Fields:

-   id
-   user_id
-   category
-   amount
-   date
-   description

## Documents

Fields:

-   id
-   user_id
-   type
-   file_url
-   expiration_date

## Journal Entries

Fields:

-   id
-   user_id
-   title
-   content
-   date

# Technical Architecture

Frontend:

-   Next.js App Router
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Lucide icons

Backend:

-   Supabase
-   PostgreSQL
-   Supabase Storage
-   Supabase Auth

Hosting:

-   Vercel

# MVP Scope

Version 1 includes:

-   Authentication
-   Student and parent roles
-   Dashboard
-   Career roadmap
-   Mission tracking
-   Calendar
-   Expense tracking
-   Journal
-   Document storage
-   Photo uploads

# Future Enhancements

Version 2:

-   FAA logbook
-   Scholarship database
-   Flight maps
-   Study tracker
-   Achievement system

Version 3:

-   AI aviation coach
-   Checkride preparation
-   Airline career planning
-   College planning
-   Instructor feedback

# Success Metrics

The application succeeds when:

-   The student knows the next action
-   The student consistently engages
-   Milestones are completed
-   Costs are understood
-   Aviation memories are preserved
-   Progress toward airline career is visible

# Final Product Statement

Flight Path is not a checklist.

It is a decade-long digital record of a young pilot's journey from
dreaming about aviation to sitting in the cockpit of a professional
aircraft.
