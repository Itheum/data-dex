/*
- Run your app in a terminal (npm start)
- In a new terminal select `npx cypress open` and select Chrome and you will see the spec.cy.ts
- The test below is trying to login the user via web wallet. You need to use a PEM key text in "-----BEGIN PRIVATE KEY... ENTER PEM BODY"
- Login seems to work, but when redirected... it's still in login screen. 

*/

beforeEach(() => {                   
  cy.session('webWalletSession', () => {     
    cy.visit('https://devnet-wallet.elrond.com/hook/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F')  // uses cookie  set by cy.login call


    cy.contains('PEM').click()
    cy.get('input[type=file]')
          .invoke('attr', 'style', 'display: block')
          .should('have.attr', 'style', 'display: block')


    cy.get('input[type=file]').selectFile({
      contents: Cypress.Buffer.from(`-----BEGIN PRIVATE KEY... ENTER PEM BODY`),
      fileName: 'wallet.pem',
      lastModified: Date.now(),
    })

    cy.contains('Access Wallet').click()
  })
})


it('logged in tests go here', () => {
  cy.visit('http://localhost:3000/')
})

