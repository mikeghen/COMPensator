import type { NextPage } from 'next'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import Navbar from '../components/navbar'
import DelegateList from '../components/delegateList'

import 'bootstrap/dist/css/bootstrap.min.css';

const DelegateListPage: NextPage = () => {
    return (
      <div className="container max-w-screen-xl m-auto pb-4 md:pb-12">
        <Head>
          <title>COMPensator | Delegate List</title>
          <meta name="description" content="COMPensator" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Toaster />
        <Navbar />
  
        <DelegateList />
  
      </div>
    )
  }

export default DelegateListPage
