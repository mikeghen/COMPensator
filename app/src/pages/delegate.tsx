import type { NextPage } from 'next'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/navbar'
import DelegateDashboard from '../components/delegateDashboard'

import 'bootstrap/dist/css/bootstrap.min.css';

const Delegate: NextPage = () => {
    return (
      <div className="container max-w-screen-xl m-auto pb-4 md:pb-12">
        <Head>
          <title>COMPensator | Delegate</title>
          <meta name="description" content="COMPensator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster />
        <Navbar />
  
        <DelegateDashboard />
  
      </div>
    )
  }

export default Delegate