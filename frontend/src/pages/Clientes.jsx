import ClienteDashboard from '../components/ClienteDashboard'

const Clientes = () => {
  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1 className="page-title cursive-font">Panel de Clientes</h1>
        <p className="page-subtitle">Encuentra el fotógrafo perfecto para tu proyecto</p>
      </div>
      <ClienteDashboard />
    </div>
  )
}

export default Clientes