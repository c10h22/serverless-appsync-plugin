import { validateConfig } from '../../validation';
import { basicConfig } from '../basicConfig';

describe('SourceApiAssociation', () => {
  describe('Valid', () => {
    const assertions = [
      {
        name: 'minimal association',
        config: {
          sourceApiAssociations: [
            {
              name: 'Books',
              mergedApiIdentifier: 'arn:aws:appsync:us-east-1:123:apis/abc',
            },
          ],
        },
      },
      {
        name: 'full association',
        config: {
          apiType: 'GRAPHQL',
          sourceApiAssociations: [
            {
              name: 'Books',
              mergedApiIdentifier: { 'Fn::GetAtt': ['MergedApi', 'Arn'] },
              description: 'Books source API',
              mergeType: 'MANUAL_MERGE',
              dependsOn: ['SomeGuard'],
            },
          ],
        },
      },
    ];

    assertions.forEach((config) => {
      it(`should validate a ${config.name}`, () => {
        expect(validateConfig({ ...basicConfig, ...config.config })).toBe(true);
      });
    });
  });

  describe('Invalid', () => {
    const assertions = [
      {
        name: 'Missing mergedApiIdentifier',
        config: {
          sourceApiAssociations: [{ name: 'Books' }],
        },
      },
      {
        name: 'Invalid name pattern',
        config: {
          sourceApiAssociations: [
            { name: 'ai-source', mergedApiIdentifier: 'arn:...' },
          ],
        },
      },
      {
        name: 'Invalid mergeType',
        config: {
          sourceApiAssociations: [
            {
              name: 'Books',
              mergedApiIdentifier: 'arn:...',
              mergeType: 'SOMETIMES_MERGE',
            },
          ],
        },
      },
      {
        name: 'Unknown property',
        config: {
          sourceApiAssociations: [
            {
              name: 'Books',
              mergedApiIdentifier: 'arn:...',
              foo: 'bar',
            },
          ],
        },
      },
      {
        name: 'Invalid apiType',
        config: {
          apiType: 'FEDERATED',
        },
      },
    ];

    assertions.forEach((config) => {
      it(`should validate: ${config.name}`, () => {
        expect(function () {
          validateConfig({ ...basicConfig, ...config.config });
        }).toThrowErrorMatchingSnapshot();
      });
    });
  });
});
