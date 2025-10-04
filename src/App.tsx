import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import BaseLayout from '@/components/BaseLayout'

function App() {
  return (
    <Routes>
      <Route element={<BaseLayout disableHeader disableFooter />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
