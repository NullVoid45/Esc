# AGENTS.md - Coding Guidelines for Hitam Outpass

## Build/Lint/Test Commands
- **Start dev server**: `npm start` or `expo start`
- **Lint code**: `npm run lint` (uses ESLint with Expo config)
- **Type check**: `npx tsc --noEmit`
- **Build for platforms**: `npm run android`, `npm run ios`, `npm run web`
- **Reset project**: `npm run reset-project`

No test framework configured yet. Run `npm install --save-dev jest @testing-library/react-native` to add testing.

## Code Style Guidelines

### General
- Use TypeScript for all new code
- Follow functional component patterns with hooks
- Use absolute imports with `@/` prefix (e.g., `@/components/Button`)
- Prefer const over let, avoid var

### Naming Conventions
- **Components**: PascalCase (e.g., `SettingsScreen`)
- **Variables/Functions**: camelCase (e.g., `handlePress`)
- **Files**: kebab-case for components (e.g., `settings-screen.tsx`), camelCase for utilities
- **Types/Interfaces**: PascalCase with descriptive names

### Imports
- Group imports: React/React Native, then third-party, then local
- Use absolute paths for local imports
- Sort imports alphabetically within groups

### Styling
- Use `StyleSheet.create()` for component styles
- Follow mobile-first responsive design
- Use theme colors from `@/constants/theme`
- Consistent spacing with multiples of 4px
- Maintain Subtle and Aesthetic design style

### Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors for debugging but don't expose sensitive info

### Component Structure
- Export default functional components
- Use descriptive prop types with TypeScript interfaces
- Keep components focused on single responsibility
- Use custom hooks for shared logic

### Performance
- Memoize expensive operations with `useMemo`/`useCallback`
- Optimize re-renders with proper dependency arrays
- Use `React.memo` for expensive components if needed

Follow existing patterns in the codebase for consistency.