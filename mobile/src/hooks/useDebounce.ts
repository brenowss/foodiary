import { useEffect, useRef, useState } from 'react';

/**
 * Hook para aplicar debounce em valores, ideal para queries e inputs de busca.
 *
 * @template T - Tipo do valor que será debounced
 * @param value - Valor atual que será debounced
 * @param delay - Delay em milissegundos para o debounce (padrão: 500ms)
 * @param options - Opções adicionais para o hook
 * @returns Objeto com valor atual, valor debounced e estados auxiliares
 *
 * @example
 * ```tsx
 * const SearchComponent = () => {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const {
 *     debouncedValue,
 *     isDebouncing,
 *     hasChanged,
 *     reset
 *   } = useDebounce(searchTerm, 300);
 *
 *   // Use debouncedValue para queries
 *   const { data } = useQuery({
 *     queryKey: ['search', debouncedValue],
 *     queryFn: () => searchAPI(debouncedValue),
 *     enabled: !!debouncedValue && !isDebouncing
 *   });
 *
 *   return (
 *     <div>
 *       <input
 *         value={searchTerm}
 *         onChange={(e) => setSearchTerm(e.target.value)}
 *         placeholder="Digite para buscar..."
 *       />
 *       {isDebouncing && <span>Buscando...</span>}
 *     </div>
 *   );
 * };
 * ```
 */

export interface UseDebounceOptions {
  /** Se true, o debounce será aplicado apenas na primeira mudança */
  leading?: boolean;
  /** Se true, o debounce será aplicado na última mudança (padrão: true) */
  trailing?: boolean;
  /** Valor inicial para o debounced value */
  initialValue?: any;
}

export interface UseDebounceReturn<T> {
  /** Valor atual (não debounced) */
  currentValue: T;
  /** Valor com debounce aplicado */
  debouncedValue: T;
  /** Indica se o debounce está ativo/aguardando */
  isDebouncing: boolean;
  /** Indica se o valor mudou desde a última atualização */
  hasChanged: boolean;
  /** Função para resetar o debounce e aplicar o valor imediatamente */
  flush: () => void;
  /** Função para cancelar o debounce pendente */
  cancel: () => void;
  /** Função para resetar ao valor inicial */
  reset: () => void;
}

export function useDebounce<T>(
  value: T,
  delay: number = 500,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { leading = false, trailing = true, initialValue = value } = options;

  // Estado para o valor debounced
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  // Estado para indicar se está debouncing
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Estado para indicar se houve mudança
  const [hasChanged, setHasChanged] = useState(false);

  // Referências para controle do timeout e valores anteriores
  const timeoutRef = useRef<number | null>(null);
  const previousValueRef = useRef<T>(value);
  const mountedRef = useRef(true);

  // Função para aplicar o valor imediatamente
  const flush = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDebouncedValue(value);
    setIsDebouncing(false);
    setHasChanged(false);
    previousValueRef.current = value;
  };

  // Função para cancelar o debounce pendente
  const cancel = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDebouncing(false);
  };

  // Função para resetar ao valor inicial
  const reset = () => {
    cancel();
    setDebouncedValue(initialValue);
    setHasChanged(false);
    previousValueRef.current = initialValue;
  };

  // Efeito principal do debounce
  useEffect(() => {
    // Verifica se o valor realmente mudou
    const valueChanged = value !== previousValueRef.current;

    if (!valueChanged) {
      return;
    }

    setHasChanged(true);
    previousValueRef.current = value;

    // Se leading está ativo e é a primeira mudança
    if (leading && timeoutRef.current === null) {
      setDebouncedValue(value);
      setHasChanged(false);
    }

    // Limpa timeout anterior se existir
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    // Se trailing está desabilitado, não faz nada mais
    if (!trailing) {
      setIsDebouncing(false);
      return;
    }

    // Indica que está debouncing
    setIsDebouncing(true);

    // Cria novo timeout
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setDebouncedValue(value);
        setIsDebouncing(false);
        setHasChanged(false);
      }
      timeoutRef.current = null;
    }, delay) as unknown as number;

    // Cleanup function
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, delay, leading, trailing]);

  // Cleanup no unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return {
    currentValue: value,
    debouncedValue,
    isDebouncing,
    hasChanged,
    flush,
    cancel,
    reset,
  };
}

/**
 * Hook simplificado para casos de uso comuns com strings (busca, filtros, etc.)
 *
 * @param value - String que será debounced
 * @param delay - Delay em milissegundos (padrão: 300ms para UX mais responsiva)
 * @returns Objeto com string debounced e estado de loading
 *
 * @example
 * ```tsx
 * const SearchInput = () => {
 *   const [query, setQuery] = useState('');
 *   const { debouncedValue: debouncedQuery, isSearching } = useSearchDebounce(query);
 *
 *   // Use em queries
 *   const { data } = useQuery({
 *     queryKey: ['search', debouncedQuery],
 *     queryFn: () => api.search(debouncedQuery),
 *     enabled: debouncedQuery.length > 2
 *   });
 * };
 * ```
 */
export function useSearchDebounce(value: string, delay: number = 300) {
  const debounce = useDebounce(value, delay);

  return {
    debouncedValue: debounce.debouncedValue,
    isSearching: debounce.isDebouncing,
    currentValue: debounce.currentValue,
    hasQuery: debounce.debouncedValue.length > 0,
    flush: debounce.flush,
    cancel: debounce.cancel,
    reset: debounce.reset,
  };
}

/**
 * Hook especializado para filtros de queries com múltiplos parâmetros
 *
 * @param filters - Objeto com os filtros que serão debounced
 * @param delay - Delay em milissegundos (padrão: 400ms)
 * @returns Objeto com filtros debounced e estados auxiliares
 *
 * @example
 * ```tsx
 * const ProductList = () => {
 *   const [filters, setFilters] = useState({
 *     name: '',
 *     category: '',
 *     minPrice: '',
 *     maxPrice: ''
 *   });
 *
 *   const {
 *     debouncedFilters,
 *     isFiltering,
 *     hasActiveFilters
 *   } = useQueryFilters(filters);
 *
 *   const { data } = useQuery({
 *     queryKey: ['products', debouncedFilters],
 *     queryFn: () => api.getProducts(debouncedFilters),
 *     enabled: !isFiltering
 *   });
 * };
 * ```
 */
export function useQueryFilters<T extends Record<string, any>>(
  filters: T,
  delay: number = 400
) {
  const debounce = useDebounce(filters, delay);

  // Verifica se há filtros ativos (valores não vazios)
  const hasActiveFilters = Object.values(debounce.debouncedValue).some(
    (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value > 0;
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    }
  );

  return {
    debouncedFilters: debounce.debouncedValue,
    currentFilters: debounce.currentValue,
    isFiltering: debounce.isDebouncing,
    hasActiveFilters,
    hasChanges: debounce.hasChanged,
    flush: debounce.flush,
    cancel: debounce.cancel,
    reset: debounce.reset,
  };
}
