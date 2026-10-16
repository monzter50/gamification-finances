# Custom Hooks - Documentación

Esta documentación describe los custom hooks implementados en el proyecto para mejorar la reutilización de lógica y prevenir problemas comunes.

## Tabla de Contenidos

1. [useMounted](#usemounted)
2. [useTransactions (eliminado)](#usetransactions-eliminado)

---

## useMounted

### Propósito

Hook para rastrear si un componente está montado actualmente. Ayuda a prevenir memory leaks y warnings de React al intentar actualizar el estado de componentes desmontados después de operaciones asíncronas.

### Ubicación

```
src/hooks/useMounted.ts
```

### API

```typescript
const { isMounted, cleanup } = useMounted();
```

#### Retorna

| Propiedad   | Tipo            | Descripción                                              |
| ----------- | --------------- | -------------------------------------------------------- |
| `isMounted` | `() => boolean` | Función que retorna `true` si el componente está montado |
| `cleanup`   | `() => void`    | Función de limpieza para usar en el return del useEffect |

### Ejemplo de Uso

```typescript
import { useEffect } from "react";
import { useMounted } from "@/hooks";

function MyComponent() {
  const { isMounted, cleanup } = useMounted();

  useEffect(() => {
    const fetchData = async () => {
      const response = await api.getData();

      // Solo actualizar estado si el componente está montado
      if (isMounted()) {
        setData(response);
      }
    };

    fetchData();

    return cleanup;
  }, [isMounted, cleanup]);

  return <div>...</div>;
}
```

### Casos de Uso

1. **Prevenir actualizaciones después de desmontar**

   ```typescript
   useEffect(() => {
     const load = async () => {
       const data = await fetchData();
       if (isMounted()) {
         setState(data);
       }
     };
     load();
     return cleanup;
   }, [isMounted, cleanup]);
   ```

2. **Manejo de errores en componentes desmontados**
   ```typescript
   try {
     const data = await api.call();
     if (isMounted()) {
       setData(data);
     }
   } catch (error) {
     if (isMounted()) {
       showError(error);
     }
   }
   ```

---

## useTransactions (eliminado)

`useTransactions`, `useTransactionSummary` y `useMonthlySummary` se reemplazaron
por React Query en `@/features/transactions` (migración, slice 3):

```tsx
import {
  TransactionsPanel, // lista paginada + edición inline + panel de detalles
  useTransactionsList, // useQuery(transactionsListQuery(filters))
  useTransactionSummary,
  useMonthlySummary, // mes 0-based, igual que los budgets
  useCreateTransaction, // mutaciones: invalidan cuentas, budgets y resúmenes
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/features/transactions";
```

Ya no hace falta recargar a mano (`loadTransactions`, `refreshAccounts`): cada
mutación llama a `invalidateFor(qc, "transaction")`. Ver
`.claude/skills/frontend-architecture/references/data-flow.md`.
