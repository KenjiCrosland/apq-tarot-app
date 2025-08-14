export interface SpreadPosition {
  id: string;
  label: string;
  area: string;
  description?: string;
}

export interface SpreadSpec {
  name: string;
  positions: SpreadPosition[];
  templates: Record<string, string>;
  columns: Record<string, string>;
  rows: Record<string, string>;
  description?: string;
}

export const spreads: Record<string, SpreadSpec> = {
  threeCard: {
    name: 'Three-Card',
    description:
      'A simple spread for exploring past, present, and future influences',
    positions: [
      {
        id: 'pos1',
        label: 'Past',
        area: 'past',
        description: 'Past influences and experiences',
      },
      {
        id: 'pos2',
        label: 'Present',
        area: 'present',
        description: 'Current situation and energies',
      },
      {
        id: 'pos3',
        label: 'Future',
        area: 'future',
        description: 'Potential outcomes and directions',
      },
    ],
    templates: {
      lg: '"past present future"',
      md: '"past present future"',
      sm: '"past" "present" "future"',
    },
    columns: {
      lg: 'repeat(3, 120px)',
      md: 'repeat(3, 100px)',
      sm: '120px',
    },
    rows: {
      lg: '180px',
      md: '160px',
      sm: 'repeat(3, 160px)',
    },
  },

  celticCross: {
    name: 'Celtic Cross',
    description:
      'A comprehensive spread for deep insight into complex situations',
    positions: [
      {
        id: 'sig',
        label: 'Significator',
        area: 'sig',
        description: 'The heart of the matter',
      },
      {
        id: 'cross',
        label: 'Cross',
        area: 'cross',
        description: 'What crosses you - challenges or support',
      },
      {
        id: 'crown',
        label: 'Crown',
        area: 'crown',
        description: 'Conscious aims and ideals',
      },
      {
        id: 'root',
        label: 'Root',
        area: 'root',
        description: 'Unconscious foundation',
      },
      {
        id: 'past',
        label: 'Recent Past',
        area: 'past',
        description: 'Recent past influences',
      },
      {
        id: 'future',
        label: 'Near Future',
        area: 'future',
        description: 'Possible near future',
      },
      {
        id: 'self',
        label: 'Self',
        area: 'self',
        description: 'Your approach to the situation',
      },
      {
        id: 'env',
        label: 'Environment',
        area: 'env',
        description: 'External influences',
      },
      {
        id: 'hopes',
        label: 'Hopes/Fears',
        area: 'hopes',
        description: 'Your hopes and fears',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        area: 'outcome',
        description: 'Potential outcome',
      },
    ],
    templates: {
      lg: `
        ". . crown . . . self"
        "past sig cross future . . env"
        ". . root . . . hopes"
        ". . . . . . outcome"
      `,
      md: `
        ". crown . self"
        "past sig cross env"
        ". root . hopes"
        ". future . outcome"
      `,
      sm: `
        "sig"
        "cross"
        "crown"
        "root"
        "past"
        "future"
        "self"
        "env"
        "hopes"
        "outcome"
      `,
    },
    columns: {
      lg: '90px 90px 90px 90px 40px 40px 90px',
      md: '90px 90px 90px 90px',
      sm: '100px',
    },
    rows: {
      lg: 'repeat(4, 140px)',
      md: 'repeat(4, 140px)',
      sm: 'repeat(10, 140px)',
    },
  },

  // Additional spread: Five-Card spread
  fiveCard: {
    name: 'Five-Card',
    description: 'Explore a situation with context and advice',
    positions: [
      {
        id: 'situation',
        label: 'Situation',
        area: 'situation',
        description: 'Current situation',
      },
      {
        id: 'challenge',
        label: 'Challenge',
        area: 'challenge',
        description: 'Main challenge or obstacle',
      },
      {
        id: 'past',
        label: 'Past',
        area: 'past',
        description: 'Past influences',
      },
      {
        id: 'future',
        label: 'Future',
        area: 'future',
        description: 'Likely outcome',
      },
      {
        id: 'advice',
        label: 'Advice',
        area: 'advice',
        description: 'Guidance for the path forward',
      },
    ],
    templates: {
      lg: `
        ". challenge ."
        "past situation future"
        ". advice ."
      `,
      md: `
        "challenge"
        "past situation future"
        "advice"
      `,
      sm: `
        "situation"
        "challenge"
        "past"
        "future"
        "advice"
      `,
    },
    columns: {
      lg: 'repeat(3, 120px)',
      md: 'repeat(3, 100px)',
      sm: '120px',
    },
    rows: {
      lg: 'repeat(3, 160px)',
      md: 'repeat(3, 150px)',
      sm: 'repeat(5, 140px)',
    },
  },

  // Horseshoe spread
  horseshoe: {
    name: 'Horseshoe',
    description: 'Seven cards exploring the path from past to future',
    positions: [
      {
        id: 'past',
        label: 'Past',
        area: 'past',
        description: 'Past influences',
      },
      {
        id: 'present',
        label: 'Present',
        area: 'present',
        description: 'Present situation',
      },
      {
        id: 'hidden',
        label: 'Hidden',
        area: 'hidden',
        description: 'Hidden influences',
      },
      {
        id: 'obstacle',
        label: 'Obstacle',
        area: 'obstacle',
        description: 'Challenges to overcome',
      },
      {
        id: 'external',
        label: 'External',
        area: 'external',
        description: 'External influences',
      },
      {
        id: 'advice',
        label: 'Advice',
        area: 'advice',
        description: 'Suggested approach',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        area: 'outcome',
        description: 'Likely outcome',
      },
    ],
    templates: {
      lg: `
        "past . . . . . outcome"
        "present . . . . . advice"
        ". . hidden obstacle external . ."
      `,
      md: `
        "past . outcome"
        "present . advice"
        "hidden obstacle external"
      `,
      sm: `
        "past"
        "present"
        "hidden"
        "obstacle"
        "external"
        "advice"
        "outcome"
      `,
    },
    columns: {
      lg: '90px 90px 90px 90px 90px 90px 90px',
      md: '100px 100px 100px',
      sm: '100px',
    },
    rows: {
      lg: 'repeat(3, 140px)',
      md: 'repeat(3, 140px)',
      sm: 'repeat(7, 140px)',
    },
  },

  // Single card draw
  singleCard: {
    name: 'Single Card',
    description: 'Draw one card for daily guidance or simple questions',
    positions: [
      {
        id: 'card',
        label: 'Your Card',
        area: 'card',
        description: 'Focus card for reflection',
      },
    ],
    templates: {
      lg: '"card"',
      md: '"card"',
      sm: '"card"',
    },
    columns: {
      lg: '150px',
      md: '130px',
      sm: '120px',
    },
    rows: {
      lg: '220px',
      md: '200px',
      sm: '180px',
    },
  },

  // Relationship spread
  relationship: {
    name: 'Relationship',
    description: 'Explore dynamics between two people',
    positions: [
      {
        id: 'you',
        label: 'You',
        area: 'you',
        description: 'Your position',
      },
      {
        id: 'other',
        label: 'Other',
        area: 'other',
        description: 'Their position',
      },
      {
        id: 'youfeel',
        label: 'You Feel',
        area: 'youfeel',
        description: 'How you feel',
      },
      {
        id: 'theyfeel',
        label: 'They Feel',
        area: 'theyfeel',
        description: 'How they feel',
      },
      {
        id: 'challenge',
        label: 'Challenge',
        area: 'challenge',
        description: 'Main challenge',
      },
      {
        id: 'outcome',
        label: 'Outcome',
        area: 'outcome',
        description: 'Potential outcome',
      },
    ],
    templates: {
      lg: `
        "you . . other"
        "youfeel . . theyfeel"
        ". challenge outcome ."
      `,
      md: `
        "you . other"
        "youfeel . theyfeel"
        ". challenge outcome"
      `,
      sm: `
        "you"
        "other"
        "youfeel"
        "theyfeel"
        "challenge"
        "outcome"
      `,
    },
    columns: {
      lg: 'repeat(4, 100px)',
      md: 'repeat(3, 100px)',
      sm: '100px',
    },
    rows: {
      lg: 'repeat(3, 150px)',
      md: 'repeat(3, 145px)',
      sm: 'repeat(6, 140px)',
    },
  },
};

// Helper function to get spread by name
export function getSpread(name: string): SpreadSpec | undefined {
  return Object.values(spreads).find(
    (spread) => spread.name.toLowerCase() === name.toLowerCase(),
  );
}

// Helper function to validate spread spec
export function validateSpreadSpec(spec: SpreadSpec): boolean {
  if (!spec.positions || spec.positions.length === 0) return false;
  if (!spec.templates || Object.keys(spec.templates).length === 0) return false;
  if (!spec.columns || Object.keys(spec.columns).length === 0) return false;
  if (!spec.rows || Object.keys(spec.rows).length === 0) return false;

  // Check that all position areas are unique
  const areas = new Set(spec.positions.map((p) => p.area));
  if (areas.size !== spec.positions.length) return false;

  // Check that templates contain all areas
  for (const template of Object.values(spec.templates)) {
    const templateAreas = template.match(/[a-z]+/gi) || [];
    for (const pos of spec.positions) {
      if (!templateAreas.includes(pos.area)) {
        console.warn(`Area "${pos.area}" not found in template`);
        return false;
      }
    }
  }

  return true;
}

// Export spread names for easy access
export const spreadNames = Object.keys(spreads);

// Export default spread
export const defaultSpread = spreads.threeCard;
