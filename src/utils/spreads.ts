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
      sm: '"past present future"',
    },
    columns: {
      lg: 'repeat(3, minmax(80px, 120px))',
      md: 'repeat(3, minmax(70px, 100px))',
      sm: 'repeat(3, minmax(45px, 60px))',
    },
    rows: {
      lg: 'minmax(120px, 180px)',
      md: 'minmax(100px, 150px)',
      sm: 'minmax(70px, 95px)',
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
        ". . crown . . self"
        "past sig cross future . env"
        ". . root . . hopes"
        ". . . . . outcome"
      `,
      sm: `
        ". crown . self"
        "past sig future env"
        ". cross . hopes"
        ". root . outcome"
      `,
    },
    columns: {
      lg: 'minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px) minmax(80px, 100px) 40px 40px minmax(80px, 100px)',
      md: 'minmax(70px, 90px) minmax(70px, 90px) minmax(70px, 90px) minmax(70px, 90px) 30px minmax(70px, 90px)',
      sm: 'repeat(4, minmax(40px, 55px))',
    },
    rows: {
      lg: 'repeat(4, minmax(120px, 160px))',
      md: 'repeat(4, minmax(100px, 140px))',
      sm: 'repeat(4, minmax(65px, 85px))',
    },
  },

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
        ". challenge ."
        "past situation future"
        ". advice ."
      `,
      sm: `
        ". challenge ."
        "past situation future"
        ". advice ."
      `,
    },
    columns: {
      lg: 'repeat(3, minmax(80px, 120px))',
      md: 'repeat(3, minmax(70px, 100px))',
      sm: 'repeat(3, minmax(45px, 60px))',
    },
    rows: {
      lg: 'repeat(3, minmax(120px, 180px))',
      md: 'repeat(3, minmax(100px, 150px))',
      sm: 'repeat(3, minmax(70px, 95px))',
    },
  },

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
        ". present . . . advice ."
        ". . hidden obstacle external . ."
      `,
      md: `
        "past . . . outcome"
        ". present . advice ."
        ". hidden obstacle external ."
      `,
      sm: `
        "past . . outcome"
        ". present advice ."
        "hidden obstacle external ."
      `,
    },
    columns: {
      lg: 'repeat(7, minmax(70px, 100px))',
      md: 'repeat(5, minmax(60px, 85px))',
      sm: 'repeat(4, minmax(40px, 55px))',
    },
    rows: {
      lg: 'repeat(3, minmax(110px, 160px))',
      md: 'repeat(3, minmax(95px, 135px))',
      sm: 'repeat(3, minmax(65px, 90px))',
    },
  },

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
      lg: 'minmax(100px, 150px)',
      md: 'minmax(85px, 120px)',
      sm: 'minmax(60px, 80px)',
    },
    rows: {
      lg: 'minmax(160px, 240px)',
      md: 'minmax(135px, 190px)',
      sm: 'minmax(95px, 130px)',
    },
  },

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
        "you . other"
        "youfeel . theyfeel"
        "challenge outcome ."
      `,
    },
    columns: {
      lg: 'repeat(4, minmax(80px, 120px))',
      md: 'repeat(3, minmax(70px, 100px))',
      sm: 'repeat(3, minmax(45px, 60px))',
    },
    rows: {
      lg: 'repeat(3, minmax(120px, 180px))',
      md: 'repeat(3, minmax(100px, 150px))',
      sm: 'repeat(3, minmax(70px, 95px))',
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
