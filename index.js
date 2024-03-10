import { ethers } from './ethers-5.6.esm.min.js'
import { abi, contractAddress } from './constants.js'

const connectButton = document.getElementById('connectButton')
const fundButton = document.getElementById('fundButton')
const withdrawButton = document.getElementById('withdrawButton')
const balanceButton = document.getElementById('balanceButton')

connectButton.onclick = connect
fundButton.onclick = fund
withdrawButton.onclick = withdraw
balanceButton.onclick = getBalance

async function connect() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      // const accounts = await window.ethereum.request({ method: 'eth_Accounts' })
      connectButton.innerHTML = 'Connected'
      // console.log(accounts)
    } catch (error) {
      connectButton.innerHTML = 'Not Connected'
    }
  } else {
    connectButton.innerHTML = 'Install Metamask!'
  }
}

async function fund() {
  const ethAmount = document.getElementById('ethAmount').value
  document.getElementById(
    'confirm'
  ).innerHTML = `Funding with ${ethAmount} ETH...`
  console.log(`Funding with ${ethAmount} ETH...`)

  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    try {
      const fundTx = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })

      waitForMining(fundTx, provider).then((txReceipt) => {
        document.getElementById(
          'confirm'
        ).innerHTML = `Funding with ${ethAmount} ETH Completed after ${txReceipt.confirmations} confirmations`
        console.log('Done!')
        // console.log(txReceipt)
      })
    } catch (error) {
      document.getElementById('confirm').innerHTML =
        'You did not confirm the transaction'
      console.error(error)
    }
  }
}

function waitForMining(tx, provider) {
  console.log(`Mining ${tx.hash}...`)
  // const listener = (txReceipt) => {
  //   console.log(`Completed after ${txReceipt.confirmations} confirmations!`)
  // }-->Remember delete before pushing to github
  return new Promise((resolve) => {
    provider.once(tx.hash, (txReceipt) => {
      console.log(`Completed after ${txReceipt.confirmations} confirmations!`)
      resolve(txReceipt)
    })
  })
}

async function getBalance() {
  if (typeof window.ethereum !== 'undefined') {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)
    const formattedBalance = ethers.utils.formatEther(balance)
    console.log(formattedBalance)
    document.getElementById(
      'balance'
    ).innerHTML = `Balance = ${formattedBalance}`
    return formattedBalance
  }
}

async function withdraw() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('Withdrawing...')
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const balance = await getBalance()
      const withdrawTx = await contract.withdraw()
      waitForMining(withdrawTx, provider).then((withdrawReceipt) => {
        document.getElementById(
          'confirm'
        ).innerHTML = `Withdrew: ${balance} ETH completed!`
        console.log('Done!', withdrawReceipt)
      })
    } catch (error) {
      document.getElementById('confirm').innerHTML = 'Error: Withdrawal failed'
      console.error(error)
    }
  }
}
