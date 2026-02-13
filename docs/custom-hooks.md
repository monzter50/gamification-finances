# Custom Hooks - Documentación

Esta documentación describe los custom hooks implementados en el proyecto para mejorar la reutilización de lógica y prevenir problemas comunes.

## Tabla de Contenidos

1. [useMounted](#usemounted)
2. [useTransactions](#usetransactions)

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

## useTransactions

### Propósito

Hook especializado para manejar toda la lógica de negocio relacionada con transacciones. Encapsula operaciones CRUD, filtrado por período de budget, y manejo de estados de carga.

### Ubicación

```
src/hooks/useTransactions.ts
```

**⚠️ Nota**: Este hook NO está exportado en `src/hooks/index.ts`. Solo debe usarse en el componente de transacciones del budget.

### API

```typescript
const {
  transactions,
  isLoading,
  loadTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} = useTransactions({
  budgetYear: 2024,
  budgetMonth: 5,
  onLoadSuccess: (data) => {},
  onLoadError: (error) => {},
});
```

#### Parámetros

| Parámetro       | Tipo                            | Requerido | Descripción                                              |
| --------------- | ------------------------------- | --------- | -------------------------------------------------------- |
| `budgetYear`    | `number`                        | ✅        | Año del budget para filtrar transacciones                |
| `budgetMonth`   | `number`                        | ✅        | Mes del budget (0-11) para filtrar transacciones         |
| `onLoadSuccess` | `(data: Transaction[]) => void` | ❌        | Callback cuando las transacciones se cargan exitosamente |
| `onLoadError`   | `(error: Error) => void`        | ❌        | Callback cuando falla la carga de transacciones          |

#### Retorna

| Propiedad           | Tipo                                                                     | Descripción                                  |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| `transactions`      | `Transaction[]`                                                          | Lista de transacciones filtradas por período |
| `isLoading`         | `boolean`                                                                | Estado de carga global                       |
| `loadTransactions`  | `() => Promise<Transaction[]>`                                           | Carga manual de transacciones                |
| `addTransaction`    | `(data: CreateTransactionRequest) => Promise<void>`                      | Agregar nueva transacción                    |
| `updateTransaction` | `(id: string, data: Partial<CreateTransactionRequest>) => Promise<void>` | Actualizar transacción existente             |
| `deleteTransaction` | `(id: string) => Promise<void>`                                          | Eliminar transacción                         |

### Ejemplo de Uso

```typescript
import { useMounted } from "@/hooks";
import { useTransactions } from "@/hooks/useTransactions";

function BudgetTransactions() {
  const { currentBudget } = useBudget();
  const { isMounted, cleanup } = useMounted();

  // Inicializar hook
  const {
    transactions,
    isLoading,
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions({
    budgetYear: currentBudget?.year || 2024,
    budgetMonth: currentBudget?.month || 0,
  });

  // Cargar transacciones cuando el budget esté listo
  useEffect(() => {
    if (!currentBudget) return;

    const load = async () => {
      try {
        await loadTransactions();
      } catch {
        // Error ya manejado en el hook
      }
    };

    if (isMounted()) {
      load();
    }

    return cleanup;
  }, [currentBudget, loadTransactions, isMounted, cleanup]);

  // Agregar transacción
  const handleAdd = async (data) => {
    try {
      await addTransaction(data);
      // Hook recarga automáticamente las transacciones
    } catch {
      // Error ya manejado en el hook
    }
  };

  return <div>...</div>;
}
```

### Características

#### 1. Filtrado Automático

El hook filtra automáticamente las transacciones por el período del budget:

```typescript
const filteredTransactions = response.data.filter((transaction) => {
  const transactionDate = new Date(transaction.date);
  return (
    transactionDate.getFullYear() === budgetYear &&
    transactionDate.getMonth() === budgetMonth
  );
});
```

#### 2. Recarga Automática

Después de cada operación CRUD, el hook recarga automáticamente la lista de transacciones:

```typescript
// Agregar
await transactionService.create(data);
await loadTransactions(); // ✅ Recarga automática

// Actualizar
await transactionService.update(id, data);
await loadTransactions(); // ✅ Recarga automática

// Eliminar
await transactionService.delete(id);
await loadTransactions(); // ✅ Recarga automática
```

#### 3. Manejo de Errores Integrado

El hook maneja errores internamente con notificaciones snackbar:

```typescript
try {
  await transactionService.create(data);
  snackbar.success({
    title: "Transaction added!",
    description: "Transaction has been added successfully.",
  });
} catch (error) {
  snackbar.error({
    title: "Failed to add transaction",
    description: error.message,
  });
  throw error; // Propaga el error para que el componente lo maneje si es necesario
}
```

### Ventajas

1. **Separación de Responsabilidades**
   - Lógica de negocio en el hook
   - UI y flujo en el componente

2. **Código más Limpio**

   ```typescript
   // Antes
   await transactionService.create(data);
   snackbar.success({ title: "...", description: "..." });
   await reloadTransactions();

   // Después
   await addTransaction(data); // ✅ Simple y limpio
   ```

3. **Reutilizable**
   - Puede usarse en otros componentes si es necesario

4. **Testeable**
   - La lógica se puede testear independientemente del componente

5. **Mantenible**
   - Cambios en la lógica solo afectan el hook
   - Componente más simple y fácil de leer

### Notas Importantes

⚠️ **Control del Padre**: El hook NO maneja el estado `isMounted` internamente. El componente padre debe usar `useMounted` y controlar cuándo se ejecutan las operaciones.

⚠️ **Uso Exclusivo**: Este hook solo debe usarse en `src/pages/main/budget/transactions/index.tsx`. No está exportado globalmente.

⚠️ **Dependencias**: El hook depende de:

- `transactionService` para operaciones CRUD
- `useSnackbar` para notificaciones
- Los parámetros `budgetYear` y `budgetMonth` para filtrado

### Diagrama de Flujo

```
Componente
    ↓
useTransactions Hook
    ↓
transactionService
    ↓
API Backend
    ↓
Response
    ↓
Filtrado por Budget Period
    ↓
Estado actualizado
    ↓
Notificación al usuario
```
