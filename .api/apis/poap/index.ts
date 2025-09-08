import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'poap/1.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * This endpoint is used to claim a POAP from a delivery.
   *
   * @summary /actions/claim-delivery-v2
   */
  pOSTActionsClaimDeliveryV2(body: types.POstActionsClaimDeliveryV2BodyParam): Promise<FetchResponse<200, types.POstActionsClaimDeliveryV2Response200>> {
    return this.core.fetch('/actions/claim-delivery-v2', 'post', body);
  }

  /**
   * This endpoint is used to claim a POAP given a previously created mint-link. The claim
   * status of the mint-link can be retrieved with the GET /actions/claim-qr endpoint.
   *
   * @summary /actions/claim-qr
   */
  pOSTActionsClaimQr(body: types.POstActionsClaimQrBodyParam): Promise<FetchResponse<200, types.POstActionsClaimQrResponse200>> {
    return this.core.fetch('/actions/claim-qr', 'post', body);
  }

  /**
   * This endpoint can be used to look up information on an individual mint-link including
   * the claim status, `secret` code, collector (if claimed), and event information.
   *
   * @summary /actions/claim-qr
   */
  gETActionsClaimQr(metadata?: types.GEtActionsClaimQrMetadataParam): Promise<FetchResponse<200, types.GEtActionsClaimQrResponse200>> {
    return this.core.fetch('/actions/claim-qr', 'get', metadata);
  }

  /**
   * This endpoint returns a list of POAPs held by an address and the event details, token
   * ID, chain, and owner address for each.
   *           A 200 status code with an empty list is returned when the address does not
   * hold any POAPs.
   *           If you already know the event ID, you can use GET
   * /actions/scan/{address}/{eventID} to check if an address holds that POAP.
   *           Note: For large collections of POAPs, it may take a while to load the artwork,
   * since average size of the original artwork can be ~2MB per item (we allow upto 4MB). For
   * solving this, we've developed a way to offer compressed artwork. To use this, you can
   * request a smaller, lower resolution version of the image, simply append "?size=small" to
   * the end of the image_url field value. For example,
   * "https://poap.xyz/image.png?size=small".
   *           For more options with artwork sizes, you can also use extra small, small,
   * medium, large, and extra large file sizes, in addition to the original size.
   *           xsmall = 64x64px
   *           small = 128x128px
   *           medium = 256x256px
   *           large = 512x512px
   *           xlarge = 1024x1024px
   *
   * @summary /actions/scan/{address}
   */
  gETActionsScan(metadata: types.GEtActionsScanMetadataParam): Promise<FetchResponse<200, types.GEtActionsScanResponse200>> {
    return this.core.fetch('/actions/scan/{address}', 'get', metadata);
  }

  /**
   * This endpoint is used to create a new delivery.
   *
   * @summary /deliveries
   */
  pOSTDeliveries(body: types.POstDeliveriesBodyParam): Promise<FetchResponse<200, types.POstDeliveriesResponse200>> {
    return this.core.fetch('/deliveries', 'post', body);
  }

  /**
   * This endpoint returns a paginated list of all deliveries in descending order by ID.
   *
   * @summary /deliveries
   */
  gETDeliveries(metadata?: types.GEtDeliveriesMetadataParam): Promise<FetchResponse<200, types.GEtDeliveriesResponse200>> {
    return this.core.fetch('/deliveries', 'get', metadata);
  }

  /**
   * This endpoint returns delivery information by delivery ID.
   *
   * @summary /delivery/{id}
   */
  gETDelivery(metadata: types.GEtDeliveryMetadataParam): Promise<FetchResponse<200, types.GEtDeliveryResponse200>> {
    return this.core.fetch('/delivery/{id}', 'get', metadata);
  }

  /**
   * This endpoint returns a delivery by it URL safe slug.
   *
   * @summary /delivery/slug/{slug}
   */
  gETDeliverySlug(metadata: types.GEtDeliverySlugMetadataParam): Promise<FetchResponse<200, types.GEtDeliverySlugResponse200>> {
    return this.core.fetch('/delivery/slug/{slug}', 'get', metadata);
  }

  /**
   * This endpoint returns the delivery claim status for an address along with the event
   * details.
   *
   * @summary /delivery-addresses/{id}/address/{address}
   */
  gETDeliveryAddressesAddress(metadata: types.GEtDeliveryAddressesAddressMetadataParam): Promise<FetchResponse<200, types.GEtDeliveryAddressesAddressResponse200>> {
    return this.core.fetch('/delivery-addresses/{id}/address/{address}', 'get', metadata);
  }

  /**
   * This endpoint returns a paginated list of addresses that can claim a delivery.
   *
   * @summary /delivery-addresses/{id}
   */
  gETDeliveryAddresses(metadata: types.GEtDeliveryAddressesMetadataParam): Promise<FetchResponse<200, types.GEtDeliveryAddressesResponse200>> {
    return this.core.fetch('/delivery-addresses/{id}', 'get', metadata);
  }

  /**
   * Returns the minting config for the specified dropId.
   *
   * @summary /drops/{dropId}/minting-config
   */
  pOSTDropsMintingConfig(metadata: types.POstDropsMintingConfigMetadataParam): Promise<FetchResponse<200, types.POstDropsMintingConfigResponse200>> {
    return this.core.fetch('/drops/{dropId}/minting-config', 'post', metadata);
  }

  /**
   * Updates the minting config for the specified dropId.
   *
   * @summary /drops/{dropId}/minting-config
   */
  pATCHDropsMintingConfig(body: types.PAtchDropsMintingConfigBodyParam, metadata: types.PAtchDropsMintingConfigMetadataParam): Promise<FetchResponse<200, types.PAtchDropsMintingConfigResponse200>> {
    return this.core.fetch('/drops/{dropId}/minting-config', 'patch', body, metadata);
  }

  /**
   * This endpoint is used to check if a secret code is valid.
   *
   * @summary /event/validate
   */
  pOSTEventValidate(body: types.POstEventValidateBodyParam): Promise<FetchResponse<200, types.POstEventValidateResponse200>> {
    return this.core.fetch('/event/validate', 'post', body);
  }

  /**
   * For the specified event ID, this endpoint returns paginated info on the token holders
   * including the token ID, POAP transfer count, and the owner's information like address,
   * amount of POAPs owned, and ENS.
   *
   * @summary /event/{id}/poaps
   */
  gETEventPoaps(metadata: types.GEtEventPoapsMetadataParam): Promise<FetchResponse<200, types.GEtEventPoapsResponse200>> {
    return this.core.fetch('/event/{id}/poaps', 'get', metadata);
  }

  /**
   * This endpoint returns the list of `qr_hash` codes for a particular event, along with the
   * claim status of each code for whether it has been claimed yet.
   *
   * @summary /event/{id}/qr-codes
   */
  pOSTEventQrCodes(body: types.POstEventQrCodesBodyParam, metadata: types.POstEventQrCodesMetadataParam): Promise<FetchResponse<200, types.POstEventQrCodesResponse200>> {
    return this.core.fetch('/event/{id}/qr-codes', 'post', body, metadata);
  }

  /**
   * This endpoint is used to create a new event. Please see the [quality
   * guidelines](https://documentation.poap.tech/docs/integration-quality-requirements) for
   * responsible event creation and distribution as well as why it's important.
   *
   * After submitting, an email will be sent to the provided email address confirming the
   * creation of the event. A follow up email will be sent when the event has been approved
   * or declined. If approved, the email will contain the requested mint-link codes for the
   * event.
   *
   * **Note**: For testing, please indicate that it's a test by adding 'test' on the artwork
   * and title, mark the event as private, and request no more than 10 mint links.
   *
   * @summary /events
   */
  pOSTEvents(body: types.POstEventsBodyParam): Promise<FetchResponse<200, types.POstEventsResponse200>> {
    return this.core.fetch('/events', 'post', body);
  }

  /**
   * This endpoint is used to retrieve the event details for a specified event ID.
   *
   * @summary /events/id/{id}
   */
  gETEventsId(metadata: types.GEtEventsIdMetadataParam): Promise<FetchResponse<200, types.GEtEventsIdResponse200>> {
    return this.core.fetch('/events/id/{id}', 'get', metadata);
  }

  /**
   * This endpoint is used to modify an event’s details. Attributes that can be changed are
   * the event name, description, country, city, start date, end date, expire date, and URL.
   * The image cannot be updated.
   *
   * **Note**: An event can only be edited within 30 days of the event start date.
   *
   * @summary /events/{fancyId}
   */
  pUTEvents(body: types.PUtEventsBodyParam, metadata: types.PUtEventsMetadataParam): Promise<FetchResponse<204, types.PUtEventsResponse204>> {
    return this.core.fetch('/events/{fancyId}', 'put', body, metadata);
  }

  /**
   * This endpoint returns event details for the specificed event fancy ID.
   *
   * @summary /events/{fancyId}
   */
  gETEvents(metadata: types.GEtEventsMetadataParam): Promise<FetchResponse<200, types.GEtEventsResponse200>> {
    return this.core.fetch('/events/{fancyId}', 'get', metadata);
  }

  /**
   * This endpoint is a health check for the API. A 200 OK status indicates the API is up and
   * running, otherwise the API is down.
   *
   * @summary /health-check
   */
  gETHealthCheck(): Promise<FetchResponse<200, types.GEtHealthCheckResponse200>> {
    return this.core.fetch('/health-check', 'get');
  }

  /**
   * This endpoint returns metadata for the specified event and token ID.
   *
   * @summary /metadata/{eventId}/{tokenId}
   */
  gETMetadata(metadata: types.GEtMetadataMetadataParam): Promise<FetchResponse<200, types.GEtMetadataResponse200>> {
    return this.core.fetch('/metadata/{eventId}/{tokenId}', 'get', metadata);
  }

  /**
   * This endpoint returns a paginated list of events in descending order by start date.
   *
   * @summary /paginated-events
   */
  gETPaginatedEvents(): Promise<FetchResponse<200, types.GEtPaginatedEventsResponse200>> {
    return this.core.fetch('/paginated-events', 'get');
  }

  pOSTQrCodeGenerate(): Promise<FetchResponse<200, types.POstQrCodeGenerateResponse200>> {
    return this.core.fetch('/qr-code/generate', 'post');
  }

  /**
   * This endpoint is used to check the status of the POAP minting. When the claim is sent,
   * it returns an ID with which we can know if it has been minted or if there was a problem
   * with it.
   *
   * @summary /transaction-requests/{id}
   */
  gETTransactionRequests(metadata: types.GEtTransactionRequestsMetadataParam): Promise<FetchResponse<200, types.GEtTransactionRequestsResponse200>> {
    return this.core.fetch('/transaction-requests/{id}', 'get', metadata);
  }

  /**
   * This endpoint is used to get the number of the total active redeem requests for an
   * event.
   *
   * @summary /redeem-requests/active/count
   */
  gETRedeemRequestsActiveCount(metadata?: types.GEtRedeemRequestsActiveCountMetadataParam): Promise<FetchResponse<200, types.GEtRedeemRequestsActiveCountResponse200>> {
    return this.core.fetch('/redeem-requests/active/count', 'get', metadata);
  }

  /**
   * This endpoint is used to request more codes for one of the following redeem methods: QR
   * Code, Secret Website, or Secret Word.
   *
   * @summary /redeem-requests
   */
  pOSTRedeemRequests(body: types.POstRedeemRequestsBodyParam): Promise<FetchResponse<200, types.POstRedeemRequestsResponse200>> {
    return this.core.fetch('/redeem-requests', 'post', body);
  }

  /**
   * This endpoint is used to obtain information about a specific secret word claims and its
   * related event.
   *
   * @summary /secret/{secret_word}
   */
  gETSecret(metadata: types.GEtSecretMetadataParam): Promise<FetchResponse<200, types.GEtSecretResponse200>> {
    return this.core.fetch('/secret/{secret_word}', 'get', metadata);
  }

  /**
   * This endpoint is used to modify an existing secret word claim for a specific event.
   *
   * To prevent someone from guessing your secret word, please use a generated randomized
   * phrase (eg: increase-group-student), and keep your mint window open for less than 10
   * minutes.
   *
   * Once the "word" or "website" is updated as you need, it's intended to be shared with
   * your collectors to claim their POAP. Note: "word" is not compatible for claiming via
   * API.
   *
   * If using secret word, direct collectors to enter the secret word into POAP Mobile app.
   * If using "website", access via browser. If POAP Mobile app is on device when accessing
   * "website", this will re-direct to POAP Mobile app and mint.
   *
   * @summary /secret-requests
   */
  pUTSecretRequests(body: types.PUtSecretRequestsBodyParam): Promise<FetchResponse<200, types.PUtSecretRequestsResponse200>> {
    return this.core.fetch('/secret-requests', 'put', body);
  }

  /**
   * This endpoint is used to create a new secret word claim for a specific event. Secret
   * word is a distribution method where POAPs can be claimed by using the specified secret
   * word. This method only works on mobile when used with POAP Mobile app.
   *
   * To prevent someone from guessing your secret word, please use a generated randomized
   * phrase (eg: increase-group-student), and keep your mint window open for less than 10
   * minutes.
   *
   * Once the "word" or "website" is created, it's intended to be shared with your collectors
   * to claim their POAP. 
   *
   * Note: "word" is not compatible for claiming via API.
   * If using secret word, direct collectors to enter the secret word into POAP Mobile app. 
   * If using "website", access via browser. If POAP Mobile app is on device when accessing
   * "website", this will re-direct to POAP Mobile app and mint.
   *
   * @summary /secret-requests
   */
  pOSTSecretRequests(body: types.POstSecretRequestsBodyParam): Promise<FetchResponse<200, types.POstSecretRequestsResponse200>> {
    return this.core.fetch('/secret-requests', 'post', body);
  }

  /**
   * This endpoint returns the POAP image URL for the specified token ID. It will return an
   * HTTP status 302 with a redirect to the image URL location.
   *
   * @summary /token/{tokenId}/image
   */
  gETTokenImage(metadata: types.GEtTokenImageMetadataParam): Promise<FetchResponse<200, types.GEtTokenImageResponse200>> {
    return this.core.fetch('/token/{tokenId}/image', 'get', metadata);
  }

  /**
   * For the specified token ID, this endpoint returns the event details, token ID, owner's
   * address, layer the POAP is currently on, and the POAP supply for that event.
   *
   * @summary /token/{tokenId}
   */
  gETToken(metadata: types.GEtTokenMetadataParam): Promise<FetchResponse<200, types.GEtTokenResponse200>> {
    return this.core.fetch('/token/{tokenId}', 'get', metadata);
  }

  /**
   * This endpoint is used to claim a POAP by using a website name. Not compatible when using
   * "word" or secret word via API.
   *
   * @summary /website/claim
   */
  pOSTWebsiteClaim(body: types.POstWebsiteClaimBodyParam): Promise<FetchResponse<200, types.POstWebsiteClaimResponse200>> {
    return this.core.fetch('/website/claim', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { GEtActionsClaimQrMetadataParam, GEtActionsClaimQrResponse200, GEtActionsScanMetadataParam, GEtActionsScanResponse200, GEtDeliveriesMetadataParam, GEtDeliveriesResponse200, GEtDeliveryAddressesAddressMetadataParam, GEtDeliveryAddressesAddressResponse200, GEtDeliveryAddressesMetadataParam, GEtDeliveryAddressesResponse200, GEtDeliveryMetadataParam, GEtDeliveryResponse200, GEtDeliverySlugMetadataParam, GEtDeliverySlugResponse200, GEtEventPoapsMetadataParam, GEtEventPoapsResponse200, GEtEventsIdMetadataParam, GEtEventsIdResponse200, GEtEventsMetadataParam, GEtEventsResponse200, GEtHealthCheckResponse200, GEtMetadataMetadataParam, GEtMetadataResponse200, GEtPaginatedEventsResponse200, GEtRedeemRequestsActiveCountMetadataParam, GEtRedeemRequestsActiveCountResponse200, GEtSecretMetadataParam, GEtSecretResponse200, GEtTokenImageMetadataParam, GEtTokenImageResponse200, GEtTokenMetadataParam, GEtTokenResponse200, GEtTransactionRequestsMetadataParam, GEtTransactionRequestsResponse200, PAtchDropsMintingConfigBodyParam, PAtchDropsMintingConfigMetadataParam, PAtchDropsMintingConfigResponse200, POstActionsClaimDeliveryV2BodyParam, POstActionsClaimDeliveryV2Response200, POstActionsClaimQrBodyParam, POstActionsClaimQrResponse200, POstDeliveriesBodyParam, POstDeliveriesResponse200, POstDropsMintingConfigMetadataParam, POstDropsMintingConfigResponse200, POstEventQrCodesBodyParam, POstEventQrCodesMetadataParam, POstEventQrCodesResponse200, POstEventValidateBodyParam, POstEventValidateResponse200, POstEventsBodyParam, POstEventsResponse200, POstQrCodeGenerateResponse200, POstRedeemRequestsBodyParam, POstRedeemRequestsResponse200, POstSecretRequestsBodyParam, POstSecretRequestsResponse200, POstWebsiteClaimBodyParam, POstWebsiteClaimResponse200, PUtEventsBodyParam, PUtEventsMetadataParam, PUtEventsResponse204, PUtSecretRequestsBodyParam, PUtSecretRequestsResponse200 } from './types';
