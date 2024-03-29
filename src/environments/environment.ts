// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  envData: {
    portal:      'Desarrollo',
    sapGwServer: 'http://clxsapjgw02:8080/ClxWebService',
    loginServer: 'http://logincentraldev.claxson.com',
    portalAdminServer: 'http://portaladmindev.claxson.com',
    hotgoBackendServer: 'http://admapps02:5000' //'http://localhost:5000'  //
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
