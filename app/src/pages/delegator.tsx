import type { NextPage } from 'next'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/navbar'
import DelegatorDashboard from '../components/delegatorDashboard'

import 'bootstrap/dist/css/bootstrap.min.css';

const Delegator: NextPage = () => {
    return (
      <div className="container max-w-screen-xl m-auto pb-4 md:pb-12">
        <Head>
          <title>COMPensator | Delegator</title>
          <meta name="description" content="COMPensator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster />
        <Navbar />
  
        <DelegatorDashboard />
  
      </div>
    )
  }

export default Delegator