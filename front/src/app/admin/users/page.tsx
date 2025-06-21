'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import { ChevronLeft, ChevronRight, Search, X, UserX, UserCheck, Edit, Eye } from 'lucide-react';
import { withAdminProtection } from '@/components/auth/with-admin-protection';
import { useNotification } from '@/components/ui/notification';
import Link from 'next/link';

// GraphQL query pour récupérer les utilisateurs avec pagination et filtres
const GET_USERS = gql`
  query GetUsers($page: Int!, $limit: Int!, $search: String) {
    users(page: $page, limit: $limit, search: $search) {
      items {
        id
        username
        email
        roles
        isActive
        createdAt
      }
      meta {
        totalItems
        itemCount
        itemsPerPage
        totalPages
        currentPage
      }
    }
  }
`;

// Mutation pour activer/désactiver un utilisateur
const TOGGLE_USER_STATUS = gql`
  mutation ToggleUserStatus($id: Int!, $isActive: Boolean!) {
    toggleUserStatus(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;

function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();
  
  // Paramètres de pagination et recherche
  const page = Number(searchParams.get('page') || '1');
  const searchTerm = searchParams.get('search') || '';
  const limit = 10;
  
  // État local pour le terme de recherche en cours de saisie
  const [searchInput, setSearchInput] = useState(searchTerm);
  
  const { data, loading, error, refetch } = useQuery(GET_USERS, {
    variables: {
      page,
      limit,
      search: searchTerm
    },
    fetchPolicy: 'network-only'
  });
  
  // Mutation pour activer/désactiver un utilisateur
  const [toggleUserStatus, { loading: toggleLoading }] = useMutation(TOGGLE_USER_STATUS, {
    onCompleted: (data) => {
      const status = data.toggleUserStatus.isActive ? 'activé' : 'désactivé';
      showNotification({
        type: 'success',
        message: `L'utilisateur a été ${status} avec succès.`
      });
      refetch();
    },
    onError: (error) => {
      showNotification({
        type: 'error',
        message: `Erreur lors de la modification du statut: ${error.message}`
      });
    }
  });
  
  // Gérer la soumission de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    params.set('page', '1');
    router.push(`/admin/users?${params.toString()}`);
  };
  
  // Effacer la recherche
  const clearSearch = () => {
    setSearchInput('');
    router.push('/admin/users');
  };
  
  // Changer de page
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/admin/users?${params.toString()}`);
  };
  
  // Gérer l'activation/désactivation d'un utilisateur
  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    if (window.confirm(`Êtes-vous sûr de vouloir ${currentStatus ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
      toggleUserStatus({
        variables: {
          id,
          isActive: !currentStatus
        }
      });
    }
  };
  
  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="p-6">
        <div className="alert alert-error">
          <p>Erreur lors du chargement des utilisateurs: {error.message}</p>
        </div>
      </div>
    );
  }
  
  const users = data?.users?.items || [];
  const meta = data?.users?.meta || { 
    currentPage: 1, 
    totalPages: 1, 
    totalItems: 0 
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <Link href="/admin" className="btn btn-outline">
          Retour au tableau de bord
        </Link>
      </div>
      
      {/* Formulaire de recherche */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              className="input input-bordered w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary">
            Rechercher
          </button>
        </form>
      </div>
      
      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto bg-base-100 rounded-lg shadow">
        <table className="table w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Rôles</th>
              <th>Statut</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <span className="loading loading-spinner loading-md"></span>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    {user.roles.map((role: string) => (
                      <span 
                        key={role} 
                        className={`badge ${role === 'admin' ? 'badge-primary' : 'badge-secondary'} mr-1`}
                      >
                        {role}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        disabled={toggleLoading}
                        className={`btn btn-sm ${user.isActive ? 'btn-error' : 'btn-success'}`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="btn btn-sm btn-info"
                        title="Voir détails"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/users/${user.id}/edit`}
                        className="btn btn-sm btn-warning"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div>
            Affichage de {((meta.currentPage - 1) * limit) + 1} à {Math.min(meta.currentPage * limit, meta.totalItems)} sur {meta.totalItems} utilisateurs
          </div>
          <div className="join">
            <button
              className="join-item btn"
              onClick={() => changePage(meta.currentPage - 1)}
              disabled={meta.currentPage <= 1}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - meta.currentPage) < 3 || p === 1 || p === meta.totalPages)
              .map((p, i, arr) => {
                // Ajouter des points de suspension si nécessaire
                if (i > 0 && p > arr[i - 1] + 1) {
                  return (
                    <span key={`ellipsis-${p}`} className="join-item btn btn-disabled">...</span>
                  );
                }
                return (
                  <button
                    key={p}
                    className={`join-item btn ${p === meta.currentPage ? 'btn-active' : ''}`}
                    onClick={() => changePage(p)}
                  >
                    {p}
                  </button>
                );
              })}
            <button
              className="join-item btn"
              onClick={() => changePage(meta.currentPage + 1)}
              disabled={meta.currentPage >= meta.totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminProtection(AdminUsersPage);
