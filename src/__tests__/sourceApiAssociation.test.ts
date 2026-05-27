import { Api } from '../resources/Api';
import { SourceApiAssociation } from '../resources/SourceApiAssociation';
import * as given from './given';

const plugin = given.plugin();

describe('SourceApiAssociation', () => {
  it('compiles a minimal association with defaults', () => {
    const api = new Api(given.appSyncConfig(), plugin);
    const association = new SourceApiAssociation(api, {
      name: 'Books',
      mergedApiIdentifier: 'arn:aws:appsync:us-east-1:123:apis/abc',
    });

    expect(association.compile()).toMatchInlineSnapshot(`
      {
        "GraphQlSourceApiAssociationBooks": {
          "DependsOn": [
            "GraphQlSchema",
          ],
          "Properties": {
            "Description": undefined,
            "MergedApiIdentifier": "arn:aws:appsync:us-east-1:123:apis/abc",
            "SourceApiAssociationConfig": {
              "MergeType": "AUTO_MERGE",
            },
            "SourceApiIdentifier": {
              "Fn::GetAtt": [
                "GraphQlApi",
                "ApiId",
              ],
            },
          },
          "Type": "AWS::AppSync::SourceApiAssociation",
        },
      }
    `);
  });

  it('accepts a cross-account ARN intrinsic, description and MANUAL_MERGE', () => {
    const api = new Api(given.appSyncConfig(), plugin);
    const association = new SourceApiAssociation(api, {
      name: 'Books',
      mergedApiIdentifier: { 'Fn::GetAtt': ['SomeMergedApi', 'Arn'] },
      description: 'Books source API',
      mergeType: 'MANUAL_MERGE',
    });

    expect(association.compile()).toMatchInlineSnapshot(`
      {
        "GraphQlSourceApiAssociationBooks": {
          "DependsOn": [
            "GraphQlSchema",
          ],
          "Properties": {
            "Description": "Books source API",
            "MergedApiIdentifier": {
              "Fn::GetAtt": [
                "SomeMergedApi",
                "Arn",
              ],
            },
            "SourceApiAssociationConfig": {
              "MergeType": "MANUAL_MERGE",
            },
            "SourceApiIdentifier": {
              "Fn::GetAtt": [
                "GraphQlApi",
                "ApiId",
              ],
            },
          },
          "Type": "AWS::AppSync::SourceApiAssociation",
        },
      }
    `);
  });

  it('appends user dependsOn after the schema and resolver dependencies', () => {
    const api = new Api(
      given.appSyncConfig({
        resolvers: {
          'Query.getAIRequest': {
            kind: 'UNIT',
            type: 'Query',
            field: 'getAIRequest',
            dataSource: 'myDataSource',
          },
        },
      }),
      plugin,
    );
    const association = new SourceApiAssociation(api, {
      name: 'Books',
      mergedApiIdentifier: 'arn:aws:appsync:us-east-1:123:apis/abc',
      dependsOn: ['SomeExternalResource'],
    });

    expect(association.compile().GraphQlSourceApiAssociationBooks.DependsOn)
      .toMatchInlineSnapshot(`
      [
        "GraphQlSchema",
        "GraphQlResolverQuerygetAIRequest",
        "SomeExternalResource",
      ]
    `);
  });

  it('compiles multiple associations through Api.compile', () => {
    const api = new Api(
      given.appSyncConfig({
        sourceApiAssociations: [
          {
            name: 'Books',
            mergedApiIdentifier: 'arn:aws:appsync:us-east-1:123:apis/abc',
          },
          {
            name: 'Reviews',
            mergedApiIdentifier: 'arn:aws:appsync:us-east-1:123:apis/def',
          },
        ],
      }),
      plugin,
    );

    const resources = api.compile();
    expect(
      Object.keys(resources).filter((id) =>
        id.startsWith('GraphQlSourceApiAssociation'),
      ),
    ).toEqual([
      'GraphQlSourceApiAssociationBooks',
      'GraphQlSourceApiAssociationReviews',
    ]);
  });

  it('emits no association resources when none are configured', () => {
    const api = new Api(given.appSyncConfig(), plugin);
    const resources = api.compile();
    expect(
      Object.keys(resources).filter((id) =>
        id.startsWith('GraphQlSourceApiAssociation'),
      ),
    ).toEqual([]);
  });

  it('throws on the not-yet-implemented apiType: MERGED', () => {
    const api = new Api(given.appSyncConfig({ apiType: 'MERGED' }), plugin);
    expect(() => api.compile()).toThrowErrorMatchingInlineSnapshot(
      `"apiType 'MERGED' is not yet implemented in this fork. Only 'GRAPHQL' source APIs are supported."`,
    );
  });
});
