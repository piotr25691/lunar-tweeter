import {
  query,
  where,
  orderBy,
  startAt,
  endAt,
  limit
} from 'firebase/firestore';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import { useCollection } from '@lib/hooks/useCollection';
import { usersCollection } from '@lib/firebase/collections';
import { useDebounce } from '@lib/hooks/useDebounce';
import { useAuth } from '@lib/context/auth-context';
import { MainContainer } from '@components/home/main-container';
import {
  ExploreLayout,
  ProtectedLayout
} from '@components/layout/common-layout';
import { MainLayout } from '@components/layout/main-layout';
import { UserCard } from '@components/user/user-card';
import { UserSearchBar } from '@components/user/user-search';
import { MainHeader } from '@components/home/main-header';
import type { User } from '@lib/types/user';

const UsersList: React.FC<{ users: User[] }> = ({ users }) => {
  if (users.length === 0) return <p className='p-5 text-center'>No user found</p>;
  

  return (
    <div>
      {users?.map((user) => (
        <UserCard key={user?.id} {...user} />
      ))}
    </div>
  );
};

export default function SearchPage(): JSX.Element {
  const [input, setInput] = useState('');

  const [dataUsers, setDataUsers] = useState<User[]>([]);

  const { user } = useAuth();
  const debouncedInput = useDebounce(input, 500);

  const { data: usersData, loading } = useCollection(
    query(
      usersCollection,
      where('username', '!=', user?.username),
      orderBy('username'),
      startAt(debouncedInput),
      endAt(debouncedInput + '\uf8ff'),
      limit(5)
    ),
    { allowNull: true }
  );

  useEffect(() => {
    if (usersData) {
      setDataUsers(usersData);
      return;
    }
    setDataUsers([]);
  }, [usersData]);

  return (
    <MainContainer>
      <MainHeader
        useMobileSidebar
        title='Search'
        className='flex items-center justify-between'
      ></MainHeader>

      <div className='container mx-auto p-4'>
        <UserSearchBar
          value={input}
          onChange={(e): void => setInput(e.target.value)}
        />
        <section className='mt-6'>
          {loading ? (
            <p className='p-5 text-center'>Searching...</p>
          ) : (
            <UsersList users={dataUsers} />
          )}
        </section>
      </div>
    </MainContainer>
  );
}

SearchPage.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <ExploreLayout>{page}</ExploreLayout>
    </MainLayout>
  </ProtectedLayout>
);
