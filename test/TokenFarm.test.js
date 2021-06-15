const DappToken = artifacts.require('DappToken');
const DaiToken = artifacts.require('DaiToken');
const TokenFarm = artifacts.require('TokenFarm');

require('chai')
	.use(require('chai-as-promised'))
	.should()

function tokens(n){
	return web3.utils.toWei(n, 'ether');
}

contract('TokenFarm', ([owner, investor]) => {

	let daiToken, dappToken, tokenFarm

	before(async() => {
		// Load Contracts
		daiToken = await DaiToken.new()
		dappToken = await DappToken.new()
		tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

		// Transfer all Dapp tokens to farm (1 million)
    	await dappToken.transfer(tokenFarm.address, tokens('1000000'))

    	// Send tokens to investor
    	await daiToken.transfer(investor, tokens('100'), { from: owner })
	})

	describe('Mock DAI Deployment', async() =>{
		it('has a name', async() => {			
			const name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})

	describe('Dapp Token Deployment', async() =>{
		it('has a name', async() => {			
			const name = await dappToken.name()
			assert.equal(name, 'DApp Token')
		})
	})

	describe('Token Farm Deployment', async() =>{
		it('has a name', async() => {			
			const name = await tokenFarm.name()
			assert.equal(name, 'Dapp Token Farm')
		})

		it('contract has tokens', async() => {			
			const balance = await dappToken.balanceOf(tokenFarm.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})
	})

	describe('Farming tokens', async() =>{
		it('Rewards investors for staking mDai tokens', async() => {
			let result

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor mock Dai wallet balance correct before staking')

			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
			await tokenFarm.stakeTokens(tokens('100'), {from: investor})

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after shaking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'Tokens Farm Mock DAI balance correct after shaking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after shaking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status correct after shaking')

			// Issue Tokens
			await tokenFarm.issueTokens({ from: owner })

			// Check Balance after issuance
			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Dapp token wallet correct after issuance')

			await tokenFarm.issueTokens({ from: investor }).should.be.rejected

			// Unstake tokens
			await tokenFarm.unstakeTokens({ from: investor} )

			await tokenFarm.unstakeTokens({ from: investor }).should.be.rejected

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI balance correct after unshaking')

			result = await dappToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI balance correct after unshaking')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after unshaking')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unshaking')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'false', 'investor staking status correct after shaking')


		})
	})

})