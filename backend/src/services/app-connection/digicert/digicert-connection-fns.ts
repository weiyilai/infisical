import { AxiosError } from "axios";

import { request } from "@app/lib/config/request";
import { BadRequestError } from "@app/lib/errors";
import { AppConnection } from "@app/services/app-connection/app-connection-enums";
import { IntegrationUrls } from "@app/services/integration-auth/integration-list";

import { DigiCertConnectionMethod } from "./digicert-connection-enums";
import { DIGICERT_AUTH_HEADER, extractDigiCertErrorMessage } from "./digicert-connection-errors";
import {
  TDigiCertConnection,
  TDigiCertConnectionConfig,
  TDigiCertOrganization,
  TDigiCertProduct
} from "./digicert-connection-types";

export const getDigiCertConnectionListItem = () => {
  return {
    name: "DigiCert" as const,
    app: AppConnection.DigiCert as const,
    methods: Object.values(DigiCertConnectionMethod) as [DigiCertConnectionMethod.ApiKey]
  };
};

export const validateDigiCertConnectionCredentials = async (config: TDigiCertConnectionConfig) => {
  const { credentials: inputCredentials } = config;

  try {
    await request.get(`${IntegrationUrls.DIGICERT_SERVICES_API_URL}/organization`, {
      headers: {
        [DIGICERT_AUTH_HEADER]: inputCredentials.apiKey,
        "Content-Type": "application/json"
      }
    });
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new BadRequestError({
        message: `Failed to validate credentials: ${extractDigiCertErrorMessage(error)}`
      });
    }
    throw new BadRequestError({
      message: `Unable to validate connection: ${(error as Error).message || "Verify credentials"}`
    });
  }

  return inputCredentials;
};

type TDigiCertOrganizationsResponse = {
  organizations: {
    id: number;
    name: string;
    display_name?: string;
    status?: string;
  }[];
};

export const listDigiCertOrganizations = async (
  appConnection: TDigiCertConnection
): Promise<TDigiCertOrganization[]> => {
  const { apiKey } = appConnection.credentials;

  try {
    const { data } = await request.get<TDigiCertOrganizationsResponse>(
      `${IntegrationUrls.DIGICERT_SERVICES_API_URL}/organization`,
      {
        headers: {
          [DIGICERT_AUTH_HEADER]: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    return (data.organizations ?? []).map((org) => ({
      id: org.id,
      name: org.name,
      displayName: org.display_name,
      status: org.status
    }));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new BadRequestError({
        message: `Failed to list DigiCert organizations: ${extractDigiCertErrorMessage(error)}`
      });
    }
    throw error;
  }
};

type TDigiCertProductsResponse = {
  products: {
    name_id: string;
    name: string;
    type?: string;
    validation_type?: string;
    signature_hash_types?: { allowed_hash_types?: { id?: string }[] };
  }[];
};

export const listDigiCertProducts = async (appConnection: TDigiCertConnection): Promise<TDigiCertProduct[]> => {
  const { apiKey } = appConnection.credentials;

  try {
    const { data } = await request.get<TDigiCertProductsResponse>(
      `${IntegrationUrls.DIGICERT_SERVICES_API_URL}/product`,
      {
        headers: {
          [DIGICERT_AUTH_HEADER]: apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    return (data.products ?? []).map((product) => ({
      nameId: product.name_id,
      name: product.name,
      type: product.type,
      validationType: product.validation_type
    }));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      throw new BadRequestError({
        message: `Failed to list DigiCert products: ${extractDigiCertErrorMessage(error)}`
      });
    }
    throw error;
  }
};
