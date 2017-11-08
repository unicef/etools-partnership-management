describe('Testing eTools PMP using Cypress', function() {
  it('Ready to start testing with Cypress!', function() {
    expect(true).to.equal(true)
  })

  it('Login to admin app', function() {
    cy.visit('/admin/login')
    // enter user
    cy.get('#login-form #id_username')
        .type('adi')
        .should('have.value', 'adi')
    // enter password
    cy.get('#login-form #id_password')
        .type('adi')
        .should('have.value', 'adi')
    // submit credentials to login
    cy.get('#login-form input[type="submit"]').click()

    cy.url().should('equal', 'http://localhost:8082/admin/');
    // check admin title, accesible only after successful login
    cy.contains('Site administration').then(() => {
      cy.request('/users/api/profile/').then((response) => {
        let user = response.body;
        expect(response.status).to.equal(200);
        expect(user).to.have.property('first_name');
        expect(user.first_name).to.equal('Adrian');

        cy.visit('/pmp/partners/list?size=10&sort=name.asc')
      })
    });
    
  })

});
