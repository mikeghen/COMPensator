import DarkModeToggle from './darkModeToggle'
import ConnectWallet from './connectWallet'
import Link from 'next/link'

interface IProps {
  displayConnectButton?: boolean
  isDarkModeToggleVisible?: boolean
}

/**
 * Navigation bar that enables connect/disconnect from Web3.
 */
const Navbar = ({
  isDarkModeToggleVisible = false,
  displayConnectButton = true,
}: // isNetworkSwitcherVisible = true,
IProps) => {
  return (
    <nav className="flex justify-between w-full py-8">
      <div className="container-fluid flex justify-between space-x-2">
        {/* Logo */}
        <div className="ml-1 transition duration-200 transform hover:rotate-20">
          <Link href="/">
            <h1 className="text-2xl text-dark font-bold"><span className="rotating-hue">🎈</span> Compensator</h1>
          </Link>
        </div>

        {/* Navigation links */}
        <ul className="flex items-center space-x-4 mx-auto">
          <li>
            <Link href="/delegate">
              <a>Delegate</a>
            </Link>
          </li>
          <li>
            <Link href="/delegateList">
              <a>Delegate List</a>
            </Link>
          </li>
          {/* Add more links here as needed */}
        </ul>

         {/* Connect to web3, dark mode toggle */}
        <div className="flex items-center space-x-2">
          {isDarkModeToggleVisible && <DarkModeToggle />}
          {displayConnectButton && <ConnectWallet />}
        </div>
      </div>

      <style jsx>{`
        .rotating-hue {
          background-image: -webkit-linear-gradient(92deg, #f35626, #feab3a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-animation: hue 30s infinite linear;
        }

        @-webkit-keyframes hue {
          from {
            -webkit-filter: hue-rotate(0deg);
          }
          to {
            -webkit-filter: hue-rotate(-360deg);
          }
        }
      `}</style>
    </nav>
  )
}

export default Navbar

