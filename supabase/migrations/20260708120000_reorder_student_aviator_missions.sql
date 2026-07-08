-- Reorder Student Aviator missions: medical and ground school before student certificate.
UPDATE missions AS m
SET order_number = mapping.new_order
FROM stages AS s,
  (VALUES
    ('Pass FAA Medical Exam', 1),
    ('Begin Ground School', 2),
    ('Obtain Student Pilot Certificate', 3)
  ) AS mapping(title, new_order)
WHERE s.order_number = 2
  AND m.stage_id = s.id
  AND m.title = mapping.title;
