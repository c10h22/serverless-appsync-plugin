# Source API associations (Merged APIs)

AWS AppSync [Merged APIs](https://docs.aws.amazon.com/appsync/latest/devguide/merged-api.html) let you combine several source GraphQL APIs into a single endpoint. This plugin can declare the [`AWS::AppSync::SourceApiAssociation`](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-appsync-sourceapiassociation.html) that registers the API it deploys as a source of a Merged API.

The Merged API itself is not managed by this plugin. You only declare, from the source API side, the association into an existing Merged API. The Merged API can live in the same account or in another account (referenced by ARN).

## Quick start

```yaml
appSync:
  name: my-source-api

  authentication:
    type: API_KEY

  # ... schema, dataSources, resolvers ...

  sourceApiAssociations:
    - name: Books
      mergedApiIdentifier: arn:aws:appsync:us-east-1:123456789012:apis/abcdefg
```

## Configuration

- `apiType`: Optional. `GRAPHQL` (default) or `MERGED`. A normal API (the kind this plugin deploys) is `GRAPHQL`. `MERGED` is reserved and not yet implemented.
- `sourceApiAssociations`: Optional. A list of associations into Merged APIs.

Each item of `sourceApiAssociations` accepts:

- `name`: Required. A name for the association. Must start with a letter and contain only letters and digits. Used to build the CloudFormation logical id and to reference the association from variables (see below).
- `mergedApiIdentifier`: Required. The Merged API to associate with. Accepts either the Merged API `ApiId` (same account) or its full ARN (required for cross-account). Can be a string or a CloudFormation intrinsic function.
- `description`: Optional. A description for the association.
- `mergeType`: Optional. `AUTO_MERGE` (default) or `MANUAL_MERGE`. With `AUTO_MERGE`, changes to the source API are merged into the Merged API automatically. With `MANUAL_MERGE`, you trigger the merge yourself.
- `dependsOn`: Optional. A list of extra CloudFormation logical ids the association must wait for. The schema and every resolver of this API are always added automatically; use `dependsOn` to add resources defined outside the `appSync` block (for example a cross-account permission resource).

## Cross-account associations

For a Merged API in another account, pass its full ARN to `mergedApiIdentifier`. The cross-account permission to merge (for example an AWS RAM share of `appsync:SourceGraphQL`) is not managed by this plugin and must be declared separately. Use `dependsOn` to make the association wait for that permission resource:

```yaml
appSync:
  name: my-source-api
  authentication:
    type: API_KEY
  sourceApiAssociations:
    - name: Books
      mergedApiIdentifier: ${param:mergedApiArn}
      description: Books source API
      mergeType: AUTO_MERGE
      dependsOn:
        - MyCrossAccountPermission # a logical id from the `resources` block
```

## Referencing the association

The association id and ARN are exported as [variables](../README.md#variables) so other resources in your stack can reference them:

- `${appsync:sourceApiAssociation.[NAME].id}`: The `AssociationId` of the association.
- `${appsync:sourceApiAssociation.[NAME].arn}`: The `AssociationArn` of the association.

```yaml
provider:
  environment:
    BOOKS_ASSOCIATION_ID: ${appsync:sourceApiAssociation.Books.id}
```
