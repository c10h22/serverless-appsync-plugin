import { CfnResources } from '../types/cloudFormation';
import { SourceApiAssociationConfig } from '../types/plugin';
import { Api } from './Api';

export class SourceApiAssociation {
  constructor(private api: Api, private config: SourceApiAssociationConfig) {}

  compile(): CfnResources {
    const logicalId = this.api.naming.getSourceApiAssociationLogicalId(
      this.config.name,
    );

    // The merge must not run before the schema and every resolver exist,
    // otherwise AppSync fails the association with "no types found in this
    // API". User-supplied dependsOn (e.g. a RAM-accepted guard) is appended.
    const dependsOn = [
      this.api.naming.getSchemaLogicalId(),
      ...Object.values(this.api.config.resolvers).map((resolver) =>
        this.api.naming.getResolverLogicalId(resolver.type, resolver.field),
      ),
      ...(this.config.dependsOn ?? []),
    ];

    return {
      [logicalId]: {
        Type: 'AWS::AppSync::SourceApiAssociation',
        DependsOn: dependsOn,
        Properties: {
          // Accepts a full ARN (cross-account) or a bare ApiId (same account).
          MergedApiIdentifier: this.config.mergedApiIdentifier,
          SourceApiIdentifier: this.api.getApiId(),
          Description: this.config.description,
          SourceApiAssociationConfig: {
            MergeType: this.config.mergeType ?? 'AUTO_MERGE',
          },
        },
      },
    };
  }
}
