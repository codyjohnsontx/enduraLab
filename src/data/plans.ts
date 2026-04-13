import {
  GoalFocus,
  SessionExercise,
  Sport,
  TrainingPlan,
  TrainingSession,
} from "@/types/domain";

type SessionTemplate = {
  title: string;
  durationMinutes: number;
  emphasis: string[];
  recommendation: string;
  blocks: TrainingSession["blocks"];
};

const focusCycle = [
  "Base durability",
  "Aerobic strength",
  "Power with control",
  "Movement quality",
  "Race-ready density",
  "Deload and sharpen",
];

function createBlocks(
  warmup: SessionExercise[],
  main: SessionExercise[],
  accessory: SessionExercise[],
  mobility: SessionExercise[],
  cooldown: SessionExercise[],
): TrainingSession["blocks"] {
  return { warmup, main, accessory, mobility, cooldown };
}

const sportTemplates: Record<Sport, SessionTemplate[]> = {
  cycling: [
    {
      title: "Torque Intervals",
      durationMinutes: 70,
      emphasis: ["W/kg", "durability", "pedaling force"],
      recommendation: "Reduce interval count by one set if readiness is yellow.",
      blocks: createBlocks(
        [
          {
            name: "Easy spin ramp",
            prescription: "10 min easy, build cadence every 2 min",
            purpose: "Warm the legs without burning matches.",
            cue: "Keep shoulders quiet and breathing nasal.",
          },
        ],
        [
          {
            name: "Big-gear seated intervals",
            prescription: "5 x 5 min moderate-hard / 3 min easy",
            purpose: "Build climbing torque without hypertrophy bias.",
            cue: "Stay seated and keep pressure smooth over the top.",
          },
        ],
        [
          {
            name: "Single-leg Romanian deadlift",
            prescription: "3 x 6/side",
            purpose: "Hip durability and posterior-chain control.",
            cue: "Own the hinge and do not let the pelvis rotate.",
          },
          {
            name: "Copenhagen plank",
            prescription: "3 x 20 sec/side",
            purpose: "Groin durability for long seated hours and sprint efforts.",
            cue: "Think long spine, not high hips.",
          },
        ],
        [
          {
            name: "Ankle dorsiflexion rocks",
            prescription: "2 x 8/side",
            purpose: "Improve ankle range for force transfer.",
            cue: "Keep the heel heavy.",
          },
        ],
        [
          {
            name: "Breathing reset",
            prescription: "3 min feet elevated breathing",
            purpose: "Downshift after quality work.",
            cue: "Long exhale, relax the jaw.",
          },
        ],
      ),
    },
    {
      title: "Endurance Builder",
      durationMinutes: 80,
      emphasis: ["aerobic base", "efficiency", "fueling discipline"],
      recommendation: "Stay conversational if soreness or stress is elevated.",
      blocks: createBlocks(
        [
          {
            name: "Spin and mobility",
            prescription: "8 min easy + 2 min thoracic openers",
            purpose: "Prep hips and trunk for long steady work.",
            cue: "Let the rib cage move with the breath.",
          },
        ],
        [
          {
            name: "Steady endurance ride",
            prescription: "50-60 min zone 2 with 6 x 15 sec cadence spins",
            purpose: "Build repeatable aerobic capacity without excess fatigue.",
            cue: "Keep pressure low and cadence snappy on spin-ups.",
          },
        ],
        [
          {
            name: "Split squat iso hold",
            prescription: "3 x 25 sec/side",
            purpose: "Tendon durability around knees and hips.",
            cue: "Vertical shin, ribs stacked over pelvis.",
          },
        ],
        [
          {
            name: "Hamstring floss",
            prescription: "2 x 8/side",
            purpose: "Posterior chain mobility after saddle time.",
            cue: "Exhale into end range, do not force it.",
          },
        ],
        [
          {
            name: "Walk and breathe",
            prescription: "5 min easy walk",
            purpose: "Bring heart rate down smoothly.",
            cue: "Let arms swing and shoulders relax.",
          },
        ],
      ),
    },
    {
      title: "Sprint Support",
      durationMinutes: 60,
      emphasis: ["neuromuscular power", "stiffness", "resilience"],
      recommendation: "If readiness is red, swap to mobility + easy spin only.",
      blocks: createBlocks(
        [
          {
            name: "Activation circuit",
            prescription: "2 rounds glute bridge, calf pogo, dead bug",
            purpose: "Prime stiffness and trunk control.",
            cue: "Quick contacts, calm trunk.",
          },
        ],
        [
          {
            name: "Standing starts",
            prescription: "6 x 10 sec start / full recovery",
            purpose: "Top-end recruitment without junk volume.",
            cue: "Explode for 6-8 pedal strokes then shut it down.",
          },
        ],
        [
          {
            name: "Farmer carry",
            prescription: "4 x 30 m",
            purpose: "Global trunk stiffness and grip.",
            cue: "Walk tall and breathe behind the shield.",
          },
        ],
        [
          {
            name: "Hip flexor opener",
            prescription: "2 x 40 sec/side",
            purpose: "Counter seated posture.",
            cue: "Tuck the tail slightly.",
          },
        ],
        [
          {
            name: "Easy flush",
            prescription: "8 min easy spin",
            purpose: "Clear tension from repeated efforts.",
            cue: "Nose inhale, mouth exhale.",
          },
        ],
      ),
    },
    {
      title: "Mobility and Trunk Stability",
      durationMinutes: 45,
      emphasis: ["durability", "mobility", "core control"],
      recommendation: "Use this as the preferred swap when pain trends upward.",
      blocks: createBlocks(
        [
          {
            name: "Mobility flow",
            prescription: "6 min hips, thoracic spine, ankles",
            purpose: "Restore movement before loading.",
            cue: "Move slow enough to own each position.",
          },
        ],
        [
          {
            name: "Tempo goblet squat",
            prescription: "3 x 5 @ 3 sec down",
            purpose: "Strength with low mass-building volume.",
            cue: "Stay tall through the middle.",
          },
          {
            name: "Half-kneeling cable chop",
            prescription: "3 x 8/side",
            purpose: "Transfer force through trunk under control.",
            cue: "Rotate around the rib cage, not the low back.",
          },
        ],
        [
          {
            name: "Tibialis raises",
            prescription: "3 x 12",
            purpose: "Lower-leg durability for long rides and running off-bike.",
            cue: "Lift through the front of the ankle, not the toes only.",
          },
        ],
        [
          {
            name: "Adductor rock-back",
            prescription: "2 x 8/side",
            purpose: "Keep hips open for efficient position changes.",
            cue: "Keep the spine long.",
          },
        ],
        [
          {
            name: "Supine twist",
            prescription: "90 sec/side",
            purpose: "Downregulate and restore rotation.",
            cue: "Exhale and let the shoulders soften.",
          },
        ],
      ),
    },
  ],
  bjj: [
    {
      title: "Grip and Pull Durability",
      durationMinutes: 60,
      emphasis: ["grip strength", "pulling endurance", "weight class discipline"],
      recommendation: "Keep reps crisp and stop short of forearm blow-up.",
      blocks: createBlocks(
        [
          {
            name: "Shoulder CARs + crawl",
            prescription: "5 min flow",
            purpose: "Wake up shoulders and trunk for grappling patterns.",
            cue: "Move the shoulder through full range without shrugging.",
          },
        ],
        [
          {
            name: "Towel pull-up cluster",
            prescription: "5 x 3 with 45 sec rest",
            purpose: "Build sport-specific grip strength with low volume.",
            cue: "Pull elbows to the ribs and own the top.",
          },
          {
            name: "Seated rope row",
            prescription: "4 x 8",
            purpose: "Reinforce pulling posture and lat endurance.",
            cue: "Drive sternum tall as hands come in.",
          },
        ],
        [
          {
            name: "Neck harness or manual resisted holds",
            prescription: "3 x 20 sec each direction",
            purpose: "Develop neck durability for scrambles and frames.",
            cue: "Brace the trunk before adding pressure.",
          },
        ],
        [
          {
            name: "90-90 hip switches",
            prescription: "2 x 8",
            purpose: "Maintain open hips for guard retention and passing.",
            cue: "Rotate around the hips, not the knees.",
          },
        ],
        [
          {
            name: "Box breathing",
            prescription: "3 min",
            purpose: "Shift out of go-mode after intense grip work.",
            cue: "Smooth inhale and controlled exhale.",
          },
        ],
      ),
    },
    {
      title: "Scramble Engine",
      durationMinutes: 55,
      emphasis: ["anaerobic endurance", "sprawl recovery", "repeat effort"],
      recommendation: "Reduce one round if sleep is under 6 hours.",
      blocks: createBlocks(
        [
          {
            name: "Hip heist + bear crawl",
            prescription: "2 rounds of 90 sec",
            purpose: "Prime scramble patterns without impact.",
            cue: "Move hips first, then hands.",
          },
        ],
        [
          {
            name: "Shark-bait intervals",
            prescription: "6 x 90 sec hard / 90 sec easy bike, row, or mat drills",
            purpose: "Train repeat effort for aggressive exchanges.",
            cue: "Attack the hard minute, then truly recover.",
          },
        ],
        [
          {
            name: "Rear-foot elevated split squat",
            prescription: "3 x 6/side",
            purpose: "Single-leg strength without excess mass.",
            cue: "Stay stacked and drive through full foot.",
          },
        ],
        [
          {
            name: "Thoracic rotations",
            prescription: "2 x 6/side",
            purpose: "Improve rotation for guard and top control transitions.",
            cue: "Follow the hand with your eyes.",
          },
        ],
        [
          {
            name: "Long exhale in child’s pose",
            prescription: "2 min",
            purpose: "Reduce tone through back and hips.",
            cue: "Melt ribs toward thighs with each exhale.",
          },
        ],
      ),
    },
    {
      title: "Isometric Strength Day",
      durationMinutes: 50,
      emphasis: ["frames", "anti-rotation", "joint integrity"],
      recommendation: "Great yellow-day session if the body feels beat up.",
      blocks: createBlocks(
        [
          {
            name: "Shoulder activation",
            prescription: "Band pull-aparts + scap push-ups x 2 rounds",
            purpose: "Prepare shoulders for framing and posting.",
            cue: "Reach long without shrugging.",
          },
        ],
        [
          {
            name: "Mid-thigh pull iso",
            prescription: "5 x 6 sec",
            purpose: "High neural strength stimulus with minimal soreness.",
            cue: "Ramp up hard and keep jaw relaxed.",
          },
          {
            name: "Pallof press hold",
            prescription: "4 x 20 sec/side",
            purpose: "Resist rotational collapse when pummeling or framing.",
            cue: "Own stillness through the torso.",
          },
        ],
        [
          {
            name: "Wrist extension work",
            prescription: "2 x 15",
            purpose: "Balance grip-heavy training.",
            cue: "Slow lowering phase.",
          },
        ],
        [
          {
            name: "Frog stretch",
            prescription: "2 x 40 sec",
            purpose: "Open adductors and hips for guard work.",
            cue: "Breathe into the groin gently.",
          },
        ],
        [
          {
            name: "Supine breathing",
            prescription: "3 min",
            purpose: "Bring nervous system back down.",
            cue: "Exhale fully before the next inhale.",
          },
        ],
      ),
    },
    {
      title: "Mobility Recovery Flow",
      durationMinutes: 40,
      emphasis: ["mobility", "durability", "recovery"],
      recommendation: "Default substitute for red readiness or post-competition weeks.",
      blocks: createBlocks(
        [
          {
            name: "Ground flow",
            prescription: "5 min get-ups, shinbox, crab reach",
            purpose: "Restore whole-body movement patterns.",
            cue: "Stay smooth and unhurried.",
          },
        ],
        [
          {
            name: "Tempo push-up + ring row",
            prescription: "3 rounds of 6 each",
            purpose: "Maintain tissue capacity with low joint stress.",
            cue: "Leave reps in the tank.",
          },
        ],
        [
          {
            name: "Band external rotation",
            prescription: "2 x 12",
            purpose: "Support shoulder health.",
            cue: "Keep elbows pinned.",
          },
        ],
        [
          {
            name: "Cossack squat stretch",
            prescription: "2 x 6/side",
            purpose: "Open hips and groin in loaded range.",
            cue: "Sit tall over the bent leg.",
          },
        ],
        [
          {
            name: "Recovery walk",
            prescription: "10 min easy",
            purpose: "Promote circulation without impact.",
            cue: "Nose breathing only.",
          },
        ],
      ),
    },
  ],
  swimming: [
    {
      title: "Threshold Engine",
      durationMinutes: 65,
      emphasis: ["aerobic threshold", "technique under fatigue", "shoulder durability"],
      recommendation: "If shoulders feel cranky, cut the final interval set.",
      blocks: createBlocks(
        [
          {
            name: "Band prep + easy swim",
            prescription: "5 min bands + 300 m easy",
            purpose: "Prime shoulders before loading.",
            cue: "Reach long without shrugging.",
          },
        ],
        [
          {
            name: "Main set",
            prescription: "6 x 200 m threshold / 30 sec rest",
            purpose: "Build sustained speed while protecting stroke quality.",
            cue: "Hold water and keep kick economical.",
          },
        ],
        [
          {
            name: "Prone trap raise",
            prescription: "3 x 10",
            purpose: "Lower-trap support for shoulder mechanics.",
            cue: "Lift with the shoulder blade, not the neck.",
          },
        ],
        [
          {
            name: "Lat stretch over bench",
            prescription: "2 x 40 sec",
            purpose: "Restore overhead range.",
            cue: "Exhale into the rib cage.",
          },
        ],
        [
          {
            name: "Easy 200 m down",
            prescription: "Choice stroke",
            purpose: "Exit the session relaxed.",
            cue: "Long stroke, easy rhythm.",
          },
        ],
      ),
    },
    {
      title: "Power and Turns",
      durationMinutes: 55,
      emphasis: ["speed", "turn quality", "trunk stiffness"],
      recommendation: "Keep power efforts fast but low in count.",
      blocks: createBlocks(
        [
          {
            name: "Kick + scull warmup",
            prescription: "300 m mixed",
            purpose: "Wake up line and catch.",
            cue: "Keep the body line long.",
          },
        ],
        [
          {
            name: "Sprint 25s",
            prescription: "12 x 25 m fast / 45 sec rest",
            purpose: "Improve top-end speed without junk distance.",
            cue: "Attack the breakout then shut it down clean.",
          },
        ],
        [
          {
            name: "Med-ball scoop toss",
            prescription: "4 x 4/side",
            purpose: "Explosive trunk rotation for starts and turns.",
            cue: "Fast hips, crisp finish.",
          },
        ],
        [
          {
            name: "Thoracic opener",
            prescription: "2 x 6/side",
            purpose: "Support rotation and streamline posture.",
            cue: "Let the mid-back move, not the low back.",
          },
        ],
        [
          {
            name: "Easy pull",
            prescription: "150 m relaxed",
            purpose: "Finish with decompression.",
            cue: "Feather-light catch.",
          },
        ],
      ),
    },
    {
      title: "Dryland Resilience",
      durationMinutes: 45,
      emphasis: ["shoulder health", "core stiffness", "anti-extension"],
      recommendation: "Ideal replacement when pool time is limited.",
      blocks: createBlocks(
        [
          {
            name: "Mobility matrix",
            prescription: "6 min shoulders, ankles, t-spine",
            purpose: "Prepare for dryland control work.",
            cue: "Move into positions you can own.",
          },
        ],
        [
          {
            name: "Landmine press",
            prescription: "3 x 6/side",
            purpose: "Press in a shoulder-friendly path.",
            cue: "Reach and rotate through the upper back.",
          },
          {
            name: "Body saw plank",
            prescription: "3 x 20 sec",
            purpose: "Build anti-extension stiffness for streamline.",
            cue: "Ribs down and glutes on.",
          },
        ],
        [
          {
            name: "Face pull",
            prescription: "3 x 12",
            purpose: "Posterior shoulder balance.",
            cue: "Lead with elbows high.",
          },
        ],
        [
          {
            name: "Doorway pec stretch",
            prescription: "2 x 35 sec",
            purpose: "Open front line after pressing and swimming.",
            cue: "Breathe into the chest, not the low back.",
          },
        ],
        [
          {
            name: "Supine 90-90 breathing",
            prescription: "2 min",
            purpose: "Reset rib cage and neck tension.",
            cue: "Exhale until abs turn on.",
          },
        ],
      ),
    },
    {
      title: "Aerobic Skill Session",
      durationMinutes: 60,
      emphasis: ["efficiency", "pace control", "movement quality"],
      recommendation: "Use this on yellow days to keep volume without forcing pace.",
      blocks: createBlocks(
        [
          {
            name: "Easy mixed warmup",
            prescription: "400 m swim/pull/kick",
            purpose: "Set rhythm without stress.",
            cue: "Stay long and quiet in the water.",
          },
        ],
        [
          {
            name: "Technique ladders",
            prescription: "3 rounds of 100 drill + 100 swim + 50 pull",
            purpose: "Accumulate quality aerobic work.",
            cue: "Smooth catch, stable head position.",
          },
        ],
        [
          {
            name: "Single-arm cable pulldown",
            prescription: "3 x 8/side",
            purpose: "Unilateral strength for catch symmetry.",
            cue: "Keep ribs stacked as the arm drives.",
          },
        ],
        [
          {
            name: "Hip flexor and lat opener",
            prescription: "2 x 30 sec each",
            purpose: "Support streamlined overhead position.",
            cue: "Long exhale into stretch.",
          },
        ],
        [
          {
            name: "Relaxed backstroke",
            prescription: "100 m easy",
            purpose: "Unload the shoulders.",
            cue: "Long strokes, easy kick.",
          },
        ],
      ),
    },
  ],
  surfing: [
    {
      title: "Paddle Endurance",
      durationMinutes: 55,
      emphasis: ["shoulder endurance", "paddle capacity", "lumbar resilience"],
      recommendation: "If the low back feels tight, cut one paddle interval set.",
      blocks: createBlocks(
        [
          {
            name: "Prone mobility flow",
            prescription: "5 min chest opener + cat-cow + scap circles",
            purpose: "Prepare for time spent prone.",
            cue: "Move the rib cage, not just the arms.",
          },
        ],
        [
          {
            name: "Paddle erg or swim intervals",
            prescription: "8 x 2 min hard / 1 min easy",
            purpose: "Build repeated paddle outputs for chasing waves.",
            cue: "Fast hands, quiet neck.",
          },
        ],
        [
          {
            name: "Back extension iso",
            prescription: "3 x 25 sec",
            purpose: "Improve prone posture tolerance without heavy spinal loading.",
            cue: "Lift through the sternum, not the chin.",
          },
        ],
        [
          {
            name: "Thread the needle",
            prescription: "2 x 6/side",
            purpose: "Restore rotation after paddling.",
            cue: "Exhale to open the back.",
          },
        ],
        [
          {
            name: "Box breathing",
            prescription: "2 min",
            purpose: "Downshift before leaving the session.",
            cue: "Even tempo all four sides.",
          },
        ],
      ),
    },
    {
      title: "Pop-Up Power",
      durationMinutes: 45,
      emphasis: ["rate of force", "hip mobility", "ankle stability"],
      recommendation: "Best done fresh; move this earlier in the week if possible.",
      blocks: createBlocks(
        [
          {
            name: "World’s greatest stretch flow",
            prescription: "4 min",
            purpose: "Open hips, ankles, and thoracic spine.",
            cue: "Own each position before moving on.",
          },
        ],
        [
          {
            name: "Pop-up clusters",
            prescription: "6 x 3 explosive reps",
            purpose: "Train the fast, clean transition to stance.",
            cue: "Hands under ribs and feet snap into place.",
          },
          {
            name: "Box jump",
            prescription: "4 x 3",
            purpose: "Elastic lower-body power with low fatigue.",
            cue: "Land soft and step down.",
          },
        ],
        [
          {
            name: "Single-leg calf raise",
            prescription: "3 x 10/side",
            purpose: "Board control and ankle durability.",
            cue: "Pause at top and lower slowly.",
          },
        ],
        [
          {
            name: "Deep squat pry",
            prescription: "2 x 40 sec",
            purpose: "Give the stance more room.",
            cue: "Breathe into the hips.",
          },
        ],
        [
          {
            name: "Walk reset",
            prescription: "5 min",
            purpose: "Ease out of explosive work.",
            cue: "Let heart rate settle gradually.",
          },
        ],
      ),
    },
    {
      title: "Rotational Strength",
      durationMinutes: 50,
      emphasis: ["trunk rotation", "stance control", "durability"],
      recommendation: "Switch to half the volume if shoulders are heavy from surfing.",
      blocks: createBlocks(
        [
          {
            name: "Band shoulder prep",
            prescription: "3 min",
            purpose: "Prep shoulders and trunk before loading rotation.",
            cue: "Smooth tension, no shrug.",
          },
        ],
        [
          {
            name: "Landmine rotation",
            prescription: "4 x 6/side",
            purpose: "Build board-control strength through the core.",
            cue: "Turn from the hips and ribs together.",
          },
          {
            name: "Lateral bound stick",
            prescription: "4 x 4/side",
            purpose: "Own edge changes and landing mechanics.",
            cue: "Land stable before the next rep.",
          },
        ],
        [
          {
            name: "Side plank with row",
            prescription: "3 x 8/side",
            purpose: "Integrate shoulder and trunk stability.",
            cue: "Keep hips long and level.",
          },
        ],
        [
          {
            name: "Adductor opener",
            prescription: "2 x 30 sec/side",
            purpose: "Support wider surf stances.",
            cue: "Exhale into the inner thigh.",
          },
        ],
        [
          {
            name: "Prone breathing",
            prescription: "2 min",
            purpose: "Relax the low back after extension work.",
            cue: "Send breath wide into the ribs.",
          },
        ],
      ),
    },
    {
      title: "Mobility and Recovery Session",
      durationMinutes: 40,
      emphasis: ["recovery", "mobility", "joint health"],
      recommendation: "Preferred red-day option when wave volume or life stress is high.",
      blocks: createBlocks(
        [
          {
            name: "Joint circles",
            prescription: "5 min full-body",
            purpose: "Lubricate without stress.",
            cue: "Slow circles, full ownership.",
          },
        ],
        [
          {
            name: "Tempo push-up + split squat",
            prescription: "3 rounds of 5 each",
            purpose: "Maintain tissue capacity lightly.",
            cue: "Move with control and stop early.",
          },
        ],
        [
          {
            name: "Band pull-apart",
            prescription: "2 x 15",
            purpose: "Keep shoulders balanced after paddling.",
            cue: "Spread through the upper back.",
          },
        ],
        [
          {
            name: "Shinbox get-up",
            prescription: "2 x 5/side",
            purpose: "Restore rotational hip control.",
            cue: "Use the floor, not momentum.",
          },
        ],
        [
          {
            name: "Legs-up breathing",
            prescription: "3 min",
            purpose: "Promote recovery and calm.",
            cue: "Long, slow exhale.",
          },
        ],
      ),
    },
  ],
};

const planGoalMap: Record<Sport, GoalFocus[]> = {
  cycling: ["strength_to_weight", "endurance", "durability"],
  bjj: ["strength_to_weight", "durability", "mobility"],
  swimming: ["endurance", "durability", "mobility"],
  surfing: ["strength_to_weight", "durability", "mobility"],
};

function buildPlanSessions(sport: Sport, trainingDays: 2 | 3 | 4) {
  const templates = sportTemplates[sport].slice(0, trainingDays);
  const sessions: TrainingSession[] = [];

  for (let week = 1; week <= 6; week += 1) {
    templates.forEach((template, index) => {
      sessions.push({
        id: `${sport}-w${week}-d${index + 1}`,
        sport,
        week,
        dayIndex: index + 1,
        title: `${template.title} · ${focusCycle[week - 1]}`,
        durationMinutes: template.durationMinutes,
        emphasis: template.emphasis,
        recommendation: template.recommendation,
        blocks: template.blocks,
      });
    });
  }

  return sessions;
}

export function buildPlanForSport(sport: Sport, trainingDays: 2 | 3 | 4): TrainingPlan {
  return {
    id: `${sport}-${trainingDays}-day-foundation`,
    sport,
    trainingDays,
    title: `${sport[0].toUpperCase()}${sport.slice(1)} Foundation`,
    description:
      "Six weeks of sport-specific training built around performance, movement quality, and durability instead of size gain.",
    goalFocus: planGoalMap[sport],
    sessions: buildPlanSessions(sport, trainingDays),
  };
}
