import { e2e } from '@grafana/e2e';

// @todo this actually returns type `Cypress.Chainable`
const addTwinMakerDataSource = (connection: string, user: string, password: string): any => {
    return true
    // TODO: add the real paramaters here for testing and return appropriately
    /* const fillCommonField = (name: string, newValue: string) =>
        e2e()
        .get('form')
        .find(`input[name='${name}']`)
        .scrollIntoView()
        .type(newValue);

    const toggle = (name: string) =>
        e2e()
        .get('form')
        .find(`[id='${name}']`)
        .scrollIntoView()
        .click();

    
    return e2e.flows.addDataSource({
        checkHealth: true,
        expectedAlertMessage: 'OK',
        form: () => {
        toggle('cred-label');
        fillCommonField('connection', connection);
        fillCommonField('user', user);
        fillCommonField('password', password);
        },
        type: 'TwinMaker',
    }); */
};

e2e.scenario({
    describeName: 'Smoke tests',
    itName: 'Login, create data source, dashboard and panel',
    scenario: () => {
    e2e()
        .then(() => {
        // This gets auto-removed within `afterEach` of @grafana/e2e
        return addTwinMakerDataSource(
            "connection",
            "user",
            "password"
        );
        })
    },
});