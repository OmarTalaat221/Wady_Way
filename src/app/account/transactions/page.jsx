

import React from 'react'
import TransactionHeader from './_components/TransactionHeader';
import TransactionTable from './_components/TransactionTable';

const Transactions = () => {
  return (
    <div className='pt-4'>
        <TransactionHeader />
        <TransactionTable />
    </div>
  )
}

export default Transactions
