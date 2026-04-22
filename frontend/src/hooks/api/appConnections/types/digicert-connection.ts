import { AppConnection } from "@app/hooks/api/appConnections/enums";
import { TRootAppConnection } from "@app/hooks/api/appConnections/types/root-connection";

export enum DigiCertConnectionMethod {
  ApiKey = "api-key"
}

export type TDigiCertConnection = TRootAppConnection & { app: AppConnection.DigiCert } & {
  method: DigiCertConnectionMethod.ApiKey;
  credentials: {
    apiKey: string;
  };
};
