import BaseApplicationGenerator from 'generator-jhipster/generators/base-application';
import { javaMainPackageTemplatesBlock } from 'generator-jhipster/generators/java/support';

export default class extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, {
      ...features,
      queueCommandTasks: true,
      sbsBlueprint: true,
    });
  }

  get [BaseApplicationGenerator.PROMPTING]() {
    return this.asPromptingTaskGroup({
      async promptingTemplateTask() {
        if (!this.config.get('lombok')) {
          const answers = await this.prompt([
            {
              type: 'checkbox',
              name: 'lombok',
              message: 'Choose classes to manage with lombok',
              choices: [
                { name: 'Criteria', value: 'criteria' },
                { name: 'DTO', value: 'dto' },
                { name: 'Entity', value: 'entity' },
                { name: 'Mapper', value: 'mapper' },
              ],
              default: ['criteria', 'dto', 'entity', 'mapper'],
            },
          ]);
          this.config.set(answers);
        }
      },
    });
  }

  get [BaseApplicationGenerator.LOADING]() {
    return this.asLoadingTaskGroup({
      async loadingTemplateTask({ application }) {
        const classes = this.config.get('lombok') || [];
        application.lombokCriteria = classes.includes('criteria');
        application.lombokDto = classes.includes('dto');
        application.lombokEntity = classes.includes('entity');
        application.lombokMapper = classes.includes('mapper');
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_ENTITIES]() {
    return this.asWritingEntitiesTaskGroup({
      async writingTemplateTask({ application, entities }) {
        await Promise.all(
          entities
            .filter(entity => !entity.builtIn && !entity.skipServer)
            .map(entity =>
              this.writeFiles({
                blocks: [
                  javaMainPackageTemplatesBlock({
                    relativePath: '_entityPackage_',
                    templates: ['domain/_persistClass_.java.jhi'],
                  }),
                ],
                context: { ...application, ...entity },
              }),
            ),
        );
      },
    });
  }

  get [BaseApplicationGenerator.WRITING_EACH_ENTITY]() {
    return this.asWritingEachEntityTaskGroup({
      async writingEachEntityTemplateTask({ entity, application }) {
        this.writeFiles({
          blocks: [
            javaMainPackageTemplatesBlock({
              relativePath: '_entityPackage_',
              templates: [
                'service/criteria/_entityClass_Criteria.java',
                'service/dto/_dtoClass_.java',
                'service/mapper/_entityClass_Mapper.java',
              ],
            }),
          ],
          context: { ...application, ...entity },
        });
      },
    });
  }
}
