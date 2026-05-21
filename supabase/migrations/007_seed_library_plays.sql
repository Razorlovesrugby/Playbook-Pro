-- Seed Data: Library Plays
-- Populates the public play library with 6 plays across categories
-- is_library_play = true, published = true, created_by = null

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 1: Out The Back Option (COMPLETE - 3 steps)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'Out The Back Option',
  'out-the-back-option-1000000001',
  'beginner',
  'Attack Structure',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "opp_22",
    "info": {
      "what_is_it": "A dummy runner off 9 pulls the defence while the ball goes out the back to a runner arriving at pace.",
      "when_to_use": "When the defence is rushing up fast and the first receiver is marked tightly.",
      "why_it_works": "The dummy line is believable — the defence commits to the wrong man.",
      "key_positions": "9, 10, 12, 13",
      "options_alternatives": "Option 2 uses 12 as the dummy instead of 10. Option 3 is a kick.",
      "common_mistakes": "The dummy runner must commit fully — a half-hearted dummy does nothing."
    },
    "steps": [
      {
        "step_id": "step_1",
        "step_number": 1,
        "description": "9 plays to 10 who shapes to pass. 12 runs the dummy line inside.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 48, "y": 45, "has_ball": true},
          {"id": "p10", "team": "attack", "number": 10, "x": 52, "y": 40, "has_ball": false},
          {"id": "p12", "team": "attack", "number": 12, "x": 58, "y": 38, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 64, "y": 36, "has_ball": false},
          {"id": "d1", "team": "defence", "number": 1, "x": 52, "y": 32, "has_ball": false},
          {"id": "d2", "team": "defence", "number": 2, "x": 58, "y": 30, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 52, "to_y": 40, "line_type": "pass", "option": 1},
          {"id": "l2", "from_player_id": "p10", "to_player_id": null, "to_x": 62, "to_y": 33, "line_type": "run", "option": 1},
          {"id": "l3", "from_player_id": "p12", "to_player_id": null, "to_x": 54, "to_y": 32, "line_type": "run", "option": 1}
        ],
        "annotations": [
          {"id": "a1", "type": "text", "x": 44, "y": 44, "text": "Ruck ball", "end_x": null, "end_y": null}
        ]
      },
      {
        "step_id": "step_2",
        "step_number": 2,
        "description": "10 passes behind 12 to 13 arriving at pace. 12s dummy run holds the defence.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 50, "y": 42, "has_ball": false},
          {"id": "p10", "team": "attack", "number": 10, "x": 55, "y": 38, "has_ball": true},
          {"id": "p12", "team": "attack", "number": 12, "x": 56, "y": 33, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 62, "y": 32, "has_ball": false},
          {"id": "d1", "team": "defence", "number": 1, "x": 54, "y": 34, "has_ball": false},
          {"id": "d2", "team": "defence", "number": 2, "x": 57, "y": 33, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p10", "to_player_id": "p13", "to_x": 62, "to_y": 32, "line_type": "pass", "option": 1},
          {"id": "l2", "from_player_id": "p13", "to_player_id": null, "to_x": 72, "to_y": 28, "line_type": "run", "option": 1}
        ],
        "annotations": []
      },
      {
        "step_id": "step_3",
        "step_number": 3,
        "description": "13 breaks the line and looks for support. 10 trails inside for the offload.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 52, "y": 40, "has_ball": false},
          {"id": "p10", "team": "attack", "number": 10, "x": 58, "y": 35, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 70, "y": 28, "has_ball": true},
          {"id": "p14", "team": "attack", "number": 14, "x": 74, "y": 22, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p13", "to_player_id": null, "to_x": 80, "to_y": 18, "line_type": "run", "option": 1},
          {"id": "l2", "from_player_id": "p10", "to_player_id": null, "to_x": 65, "to_y": 30, "line_type": "run", "option": 1}
        ],
        "annotations": [
          {"id": "a1", "type": "text", "x": 48, "y": 20, "text": "Try line", "end_x": null, "end_y": null}
        ]
      }
    ]
  }'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 2: The Crash Ball (COMPLETE - 3 steps)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'The Crash Ball',
  'the-crash-ball-2000000002',
  'beginner',
  'Attack Structure',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "opp_22",
    "info": {
      "what_is_it": "12 runs a hard crash line off 10 to suck in defenders and create quick ball.",
      "when_to_use": "When you need front-foot ball and the defence is drifting. Good on slow ruck ball.",
      "why_it_works": "The crash runner bends the line, forces defenders to commit, and opens space wide.",
      "key_positions": "10, 12, 13",
      "options_alternatives": "Option 2: 10 pulls the pass and goes out the back to 13. Option 3: 12 offloads before contact.",
      "common_mistakes": "Crash runner must run straight — drifting makes the pass too easy to read."
    },
    "steps": [
      {
        "step_id": "step_1",
        "step_number": 1,
        "description": "9 passes to 10. 12 shapes to run the crash line.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 40, "y": 45, "has_ball": true},
          {"id": "p10", "team": "attack", "number": 10, "x": 46, "y": 42, "has_ball": false},
          {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 38, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 56, "y": 40, "has_ball": false},
          {"id": "d6", "team": "defence", "number": 6, "x": 48, "y": 32, "has_ball": false},
          {"id": "d12", "team": "defence", "number": 12, "x": 52, "y": 34, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 46, "to_y": 42, "line_type": "pass", "option": 1},
          {"id": "l2", "from_player_id": "p12", "to_player_id": null, "to_x": 56, "to_y": 30, "line_type": "run", "option": 1}
        ],
        "annotations": [
          {"id": "a1", "type": "text", "x": 36, "y": 44, "text": "Ruck", "end_x": null, "end_y": null}
        ]
      },
      {
        "step_id": "step_2",
        "step_number": 2,
        "description": "10 hits 12 on a short, flat pass. 12 runs directly at the inside shoulder of the defensive 6.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 42, "y": 44, "has_ball": false},
          {"id": "p10", "team": "attack", "number": 10, "x": 46, "y": 40, "has_ball": true},
          {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 36, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 54, "y": 38, "has_ball": false},
          {"id": "d6", "team": "defence", "number": 6, "x": 50, "y": 33, "has_ball": false},
          {"id": "d12", "team": "defence", "number": 12, "x": 54, "y": 34, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p10", "to_player_id": "p12", "to_x": 50, "to_y": 36, "line_type": "pass", "option": 1},
          {"id": "l2", "from_player_id": "p12", "to_player_id": null, "to_x": 52, "to_y": 30, "line_type": "run", "option": 1},
          {"id": "l3", "from_player_id": "p13", "to_player_id": null, "to_x": 60, "to_y": 42, "line_type": "run", "option": 2}
        ],
        "annotations": [
          {"id": "a1", "type": "arrow", "x": 50, "y": 45, "text": "", "end_x": 52, "end_y": 28}
        ]
      },
      {
        "step_id": "step_3",
        "step_number": 3,
        "description": "12 takes contact and presents quick ball. 9 clears to 10 who attacks the space behind.",
        "players": [
          {"id": "p9", "team": "attack", "number": 9, "x": 48, "y": 42, "has_ball": false},
          {"id": "p10", "team": "attack", "number": 10, "x": 50, "y": 38, "has_ball": true},
          {"id": "p12", "team": "attack", "number": 12, "x": 52, "y": 30, "has_ball": false},
          {"id": "p13", "team": "attack", "number": 13, "x": 60, "y": 42, "has_ball": false},
          {"id": "p11", "team": "attack", "number": 11, "x": 66, "y": 32, "has_ball": false}
        ],
        "lines": [
          {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 50, "to_y": 38, "line_type": "pass", "option": 1},
          {"id": "l2", "from_player_id": "p10", "to_player_id": "p11", "to_x": 66, "to_y": 32, "line_type": "pass", "option": 1},
          {"id": "l3", "from_player_id": "p11", "to_player_id": null, "to_x": 78, "to_y": 22, "line_type": "run", "option": 1}
        ],
        "annotations": [
          {"id": "a1", "type": "text", "x": 54, "y": 26, "text": "Quick ball", "end_x": null, "end_y": null}
        ]
      }
    ]
  }'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 3: Lineout Drive (STUB - 1 step, fills library)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'Lineout Drive',
  'lineout-drive-3000000003',
  'beginner',
  'Set Piece',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "lineout_l",
    "info": {
      "what_is_it": "Set-piece maul from a 5-man lineout. Hooker throws, jumper catches, maul forms and drives forward.",
      "when_to_use": "Attacking lineout inside the opposition 22.",
      "why_it_works": "Disciplined maul is nearly impossible to legally stop. Commits forwards and creates mismatches in the backs.",
      "key_positions": "2, 4, 5, 8",
      "options_alternatives": "Option 2 peels off the back early. Option 3 fakes the maul and goes wide.",
      "common_mistakes": "Jumper must transfer the ball to the scrum-half immediately — holding on invites the sack."
    },
    "steps": [{
      "step_id": "step_1",
      "step_number": 1,
      "description": "Hooker throws to jumper at 2. Maul forms. Forwards bind and drive.",
      "players": [
        {"id": "p2", "team": "attack", "number": 2, "x": 50, "y": 80, "has_ball": false},
        {"id": "p4", "team": "attack", "number": 4, "x": 48, "y": 55, "has_ball": true},
        {"id": "p5", "team": "attack", "number": 5, "x": 52, "y": 55, "has_ball": false},
        {"id": "p8", "team": "attack", "number": 8, "x": 50, "y": 62, "has_ball": false}
      ],
      "lines": [
        {"id": "l1", "from_player_id": "p2", "to_player_id": "p4", "to_x": 48, "to_y": 55, "line_type": "pass", "option": 1},
        {"id": "l2", "from_player_id": "p5", "to_player_id": null, "to_x": 50, "to_y": 40, "line_type": "run", "option": 1}
      ],
      "annotations": [
        {"id": "a1", "type": "text", "x": 40, "y": 85, "text": "Lineout", "end_x": null, "end_y": null},
        {"id": "a2", "type": "target", "x": 48, "y": 55, "text": "Jumper", "end_x": null, "end_y": null}
      ]
    }]
  }'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 4: Scrum Backs Move (STUB)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'Scrum Backs Move',
  'scrum-backs-move-4000000004',
  'intermediate',
  'Set Piece',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "opp_half",
    "info": {
      "what_is_it": "Off the scrum, 8 picks and goes blind before releasing 9 who hits 10 with a miss-pass to 13 on the loop.",
      "when_to_use": "Scrum feed on the left side of the field. Defence is narrow.",
      "why_it_works": "The blindside pick-and-go draws the back-row defence in, creating the overlap out wide.",
      "key_positions": "8, 9, 10, 13",
      "options_alternatives": "Option 2: 10 takes it flat and hits 12 on the crash. Option 3: 10 cross-kicks to 14.",
      "common_mistakes": "8 must commit the blindside winger — a soft carry lets them drift onto the backs."
    },
    "steps": [{
      "step_id": "step_1",
      "step_number": 1,
      "description": "Scrum set. 8 controls at the base. 9 and 10 set up for the move.",
      "players": [
        {"id": "p8", "team": "attack", "number": 8, "x": 44, "y": 50, "has_ball": true},
        {"id": "p9", "team": "attack", "number": 9, "x": 40, "y": 48, "has_ball": false},
        {"id": "p10", "team": "attack", "number": 10, "x": 52, "y": 42, "has_ball": false},
        {"id": "p12", "team": "attack", "number": 12, "x": 58, "y": 40, "has_ball": false},
        {"id": "p13", "team": "attack", "number": 13, "x": 64, "y": 38, "has_ball": false}
      ],
      "lines": [
        {"id": "l1", "from_player_id": "p8", "to_player_id": "p9", "to_x": 40, "to_y": 48, "line_type": "pass", "option": 1}
      ],
      "annotations": [
        {"id": "a1", "type": "text", "x": 36, "y": 52, "text": "Scrum", "end_x": null, "end_y": null}
      ]
    }]
  }'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 5: The Skip Pass (STUB)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'The Skip Pass',
  'the-skip-pass-5000000005',
  'intermediate',
  'Attack Structure',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "opp_half",
    "info": {
      "what_is_it": "10 deliberately skips 12 with a long pass to 13 to exploit a rushed defence on the outside.",
      "when_to_use": "When the defence is up fast on 12 but leaving space outside. Good on front-foot ball.",
      "why_it_works": "The skip pass isolates the outside defender and gives the outside backs a 2-on-1 or 3-on-2.",
      "key_positions": "10, 12, 13, 14",
      "options_alternatives": "Option 2: 12 runs a decoy line to hold the D. Option 3: 10 dummies the skip and hits 12 short.",
      "common_mistakes": "Skip pass must be flat and hard — a floated pass is intercept bait."
    },
    "steps": [{
      "step_id": "step_1",
      "step_number": 1,
      "description": "9 feeds 10. 12 runs a hard decoy line. 10 skips 12 and hits 13.",
      "players": [
        {"id": "p9", "team": "attack", "number": 9, "x": 38, "y": 48, "has_ball": true},
        {"id": "p10", "team": "attack", "number": 10, "x": 44, "y": 44, "has_ball": false},
        {"id": "p12", "team": "attack", "number": 12, "x": 50, "y": 40, "has_ball": false},
        {"id": "p13", "team": "attack", "number": 13, "x": 58, "y": 36, "has_ball": false},
        {"id": "p14", "team": "attack", "number": 14, "x": 66, "y": 32, "has_ball": false}
      ],
      "lines": [
        {"id": "l1", "from_player_id": "p9", "to_player_id": "p10", "to_x": 44, "to_y": 44, "line_type": "pass", "option": 1},
        {"id": "l2", "from_player_id": "p10", "to_player_id": "p13", "to_x": 58, "to_y": 36, "line_type": "pass", "option": 1},
        {"id": "l3", "from_player_id": "p12", "to_player_id": null, "to_x": 48, "to_y": 32, "line_type": "run", "option": 1}
      ],
      "annotations": [
        {"id": "a1", "type": "text", "x": 56, "y": 50, "text": "SKIP", "end_x": null, "end_y": null}
      ]
    }]
  }'::jsonb
);

-- ═══════════════════════════════════════════════════════════════════
-- PLAY 6: Defensive Blitz (STUB)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO plays (title, slug, difficulty, category, is_library_play, published, play_data)
VALUES (
  'Defensive Blitz',
  'defensive-blitz-6000000006',
  'intermediate',
  'Defence',
  true,
  true,
  '{
    "version": 1,
    "field_zone": "own_half",
    "info": {
      "what_is_it": "Aggressive line-speed defence with the blindside winger shooting up to cut off the wide pass.",
      "when_to_use": "When the opposition is playing wide-to-wide and you want to force them back inside.",
      "why_it_works": "The blitz denies time and space for the first receiver, forcing rushed decisions and handling errors.",
      "key_positions": "6, 7, 10, 11",
      "options_alternatives": "Option 2: Hold the line and drift. Option 3: Double-blitz through 6 and 7.",
      "common_mistakes": "If the blitz is mistimed, the opposition can chip behind or offload to the space vacated."
    },
    "steps": [{
      "step_id": "step_1",
      "step_number": 1,
      "description": "Defensive line set. 11 shoots up to pressure the first receiver. 6 and 7 cover inside.",
      "players": [
        {"id": "d6", "team": "defence", "number": 6, "x": 46, "y": 38, "has_ball": false},
        {"id": "d7", "team": "defence", "number": 7, "x": 50, "y": 36, "has_ball": false},
        {"id": "d11", "team": "defence", "number": 11, "x": 56, "y": 34, "has_ball": false},
        {"id": "d12", "team": "defence", "number": 12, "x": 52, "y": 40, "has_ball": false},
        {"id": "d13", "team": "defence", "number": 13, "x": 60, "y": 38, "has_ball": false}
      ],
      "lines": [
        {"id": "l1", "from_player_id": "d11", "to_player_id": null, "to_x": 52, "to_y": 38, "line_type": "run", "option": 1},
        {"id": "l2", "from_player_id": "d6", "to_player_id": null, "to_x": 42, "to_y": 44, "line_type": "run", "option": 1}
      ],
      "annotations": [
        {"id": "a1", "type": "text", "x": 40, "y": 24, "text": "BLITZ LINE", "end_x": null, "end_y": null}
      ]
    }]
  }'::jsonb
);
