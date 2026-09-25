import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  RABBITMQ_URL: string;
  RABBITMQ_QUEUE: string;
  CATALOG_QUEUE: string;
  ELASTICSEARCH_NODE: string;
  HOTELS_ALIAS: string;
}

const envsSchema = joi
  .object({
    RABBITMQ_URL: joi.string().required(),
    RABBITMQ_QUEUE: joi.string().required(),
    CATALOG_QUEUE: joi.string().required(),
    ELASTICSEARCH_NODE: joi.string().required(),
    HOTELS_ALIAS: joi.string().default('hotels'),
  })
  .unknown(true);

const result = envsSchema.validate(process.env) as {
  error?: joi.ValidationError;
  value: EnvVars;
};

if (result.error) {
  throw new Error(`Config validation error: ${result.error.message}`);
}

const envVars = result.value;

export const envs = {
  rabbitmqUrl: envVars.RABBITMQ_URL,
  rabbitmqQueue: envVars.RABBITMQ_QUEUE,
  catalogQueue: envVars.CATALOG_QUEUE,
  elasticsearchNode: envVars.ELASTICSEARCH_NODE,
  hotelsAlias: envVars.HOTELS_ALIAS,
};
