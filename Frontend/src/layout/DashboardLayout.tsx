import { NavLink, Outlet } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function DashboardLayout() {

  return (
    <div className="flex min-h-screen">
      <div className="fixed left-0 top-0 bottom-0 p-6 w-64 bg-blue-100 z-10">
        <NavLink to={'/'}>
          <img src="/public/logo.png" alt="logo" className='h-34 w-48' />
        </NavLink>
        <br />
        <div className='flex flex-col justify-between h-[calc(100%-5rem)] w-full'>
          <ul className=''>
            <li className='mb-8'>
              <NavLink
                to="/"
                end
                className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-primario' : 'text-secundario'}`}
              >
                <Icon icon="mage:dashboard-fill" width="22" height="22" />
                Dashboard
              </NavLink>
            </li>
            <li className='mb-8'>
              <NavLink to={"/admin/pedidos"} className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-neutro' : 'text-secundario'}`}>
                <Icon icon="lets-icons:order" width="22" height="22" />
                Siniestros
              </NavLink>
            </li>
            <li className='mb-8'>
              <NavLink to={"/admin/cotizaciones"} className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-neutro' : 'text-secundario'}`}>
                <Icon icon="famicons:receipt-outline" width="22" height="22" />
                Documentos
              </NavLink>
            </li>
            <li className='mb-8'>
              <NavLink to={"/admin/inventario"} className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-neutro' : 'text-secundario'}`}>
                <Icon icon="streamline-plump:warehouse-1-solid" width="22" height="22" />
                Poliza
              </NavLink>
            </li>
            <li className='mb-8'>
              <NavLink to={"/admin/clientes"} className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-neutro' : 'text-secundario'}`}>
                <Icon icon="mage:users-fill" width="22" height="22" />
                Proveedores
              </NavLink>
            </li>
            <li className='mb-8'>
              <NavLink to={"/admin/productos"} className={({ isActive }) => `flex items-center gap-2 font-bold hover:text-neutro ${isActive ? 'text-neutro' : 'text-secundario'}`}>
                <Icon icon="lucide:tag" width="22" height="22" />
                Asegurado
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
      <div className='ml-64 flex-1 min-h-screen'>
        <div className='p-6 w-full'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
