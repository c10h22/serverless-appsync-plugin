import * as given from './given';

const plugin = given.plugin();

describe('variable', () => {
  it('should resolve the api id', () => {
    expect(
      plugin.resolveVariable({
        address: 'id',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlApi",
            "ApiId",
          ],
        },
      }
    `);
  });

  it('should resolve the api url', () => {
    expect(
      plugin.resolveVariable({
        address: 'url',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlApi",
            "GraphQLUrl",
          ],
        },
      }
    `);
  });

  it('should resolve the api arn', () => {
    expect(
      plugin.resolveVariable({
        address: 'arn',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlApi",
            "Arn",
          ],
        },
      }
    `);
  });

  it('should resolve an api key', () => {
    expect(
      plugin.resolveVariable({
        address: 'apiKey.foo',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlApifoo",
            "ApiKey",
          ],
        },
      }
    `);
  });

  it('should resolve a source api association id', () => {
    expect(
      plugin.resolveVariable({
        address: 'sourceApiAssociation.Books.id',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlSourceApiAssociationBooks",
            "AssociationId",
          ],
        },
      }
    `);
  });

  it('should resolve a source api association arn', () => {
    expect(
      plugin.resolveVariable({
        address: 'sourceApiAssociation.Books.arn',
        options: {},
        resolveVariable: () => '',
      }),
    ).toMatchInlineSnapshot(`
      {
        "value": {
          "Fn::GetAtt": [
            "GraphQlSourceApiAssociationBooks",
            "AssociationArn",
          ],
        },
      }
    `);
  });
});

describe('services without an appSync block', () => {
  const hooks = [
    'before:logs:logs',
    'before:deploy:function:initialize',
    'before:package:initialize',
    'before:aws:info:gatherData',
    'after:aws:info:gatherData',
    'after:aws:info:displayServiceInfo',
  ];

  it.each(hooks)('should no-op on %s when appSync is undefined', (hook) => {
    const noAppSyncPlugin = given.plugin();
    delete noAppSyncPlugin.serverless.configurationInput.appSync;
    expect(() => noAppSyncPlugin.hooks[hook]()).not.toThrow();
  });
});
