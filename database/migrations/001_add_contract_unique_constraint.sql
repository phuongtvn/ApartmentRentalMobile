-- Migration: Add unique constraint to enforce one active contract per room
-- Date: 2026-02-16
-- Description: Ensures only one active/draft lease (contract) can exist per room at any time.

-- Create a unique partial index on the leases table
-- This enforces the business rule: "There is only one contract per room"
-- Only one lease with status 'active' or 'draft' can exist for a given room_id
CREATE UNIQUE INDEX idx_leases_one_active_per_room
    ON leases (room_id)
    WHERE status IN ('active', 'draft');

-- Add a comment explaining the constraint
COMMENT ON INDEX idx_leases_one_active_per_room IS 'Ensures only one active or draft lease per room at any time';
