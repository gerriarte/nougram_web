/**
 * Color Palette Reference Component
 * Visual guide to the Material Design 3 color system
 * This component is for documentation purposes
 */

export function ColorPalette() {
  const primaryColors = [
    { name: 'Primary 50', value: '#E3F2FD', text: 'dark' },
    { name: 'Primary 100', value: '#BBDEFB', text: 'dark' },
    { name: 'Primary 200', value: '#90CAF9', text: 'dark' },
    { name: 'Primary 300', value: '#64B5F6', text: 'dark' },
    { name: 'Primary 400', value: '#42A5F5', text: 'dark' },
    { name: 'Primary 500', value: '#2196F3', text: 'light' },
    { name: 'Primary 600', value: '#1E88E5', text: 'light' },
    { name: 'Primary 700', value: '#1976D2', text: 'light' },
    { name: 'Primary 800', value: '#1565C0', text: 'light' },
    { name: 'Primary 900', value: '#0D47A1', text: 'light' }
  ];

  const greyColors = [
    { name: 'Grey 50', value: '#FAFAFA', text: 'dark' },
    { name: 'Grey 100', value: '#F5F5F5', text: 'dark' },
    { name: 'Grey 200', value: '#EEEEEE', text: 'dark' },
    { name: 'Grey 300', value: '#E0E0E0', text: 'dark' },
    { name: 'Grey 400', value: '#BDBDBD', text: 'dark' },
    { name: 'Grey 500', value: '#9E9E9E', text: 'light' },
    { name: 'Grey 600', value: '#757575', text: 'light' },
    { name: 'Grey 700', value: '#616161', text: 'light' },
    { name: 'Grey 800', value: '#424242', text: 'light' },
    { name: 'Grey 900', value: '#212121', text: 'light' }
  ];

  const semanticColors = [
    { name: 'Success 500', value: '#4CAF50', text: 'light', usage: 'Positive actions, won projects' },
    { name: 'Error 500', value: '#F44336', text: 'light', usage: 'Errors, destructive actions' },
    { name: 'Warning 500', value: '#FF9800', text: 'dark', usage: 'Warnings, cautions' },
    { name: 'Info 500', value: '#2196F3', text: 'light', usage: 'Information, neutral' }
  ];

  return (
    <div className="p-8 bg-grey-50 space-y-8">
      <div>
        <h1 className="mb-2">Nougram Color Palette</h1>
        <p className="text-grey-600">Material Design 3 color system reference</p>
      </div>

      {/* Primary Colors */}
      <div>
        <h2 className="mb-4">Primary Colors</h2>
        <div className="grid grid-cols-5 gap-4">
          {primaryColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-24 rounded-lg border border-grey-200 flex items-center justify-center"
                style={{ backgroundColor: color.value }}
              >
                <span className={`text-xs ${color.text === 'light' ? 'text-white' : 'text-grey-900'}`}>
                  {color.name}
                </span>
              </div>
              <p className="text-xs text-grey-600 text-center">{color.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-info-50 rounded-lg">
          <p className="text-info-800 text-xs">
            <strong>Usage:</strong> Primary 500 for main actions, Primary 700 for hover states, 
            Primary 100 for subtle backgrounds
          </p>
        </div>
      </div>

      {/* Grey Scale */}
      <div>
        <h2 className="mb-4">Grey Scale</h2>
        <div className="grid grid-cols-5 gap-4">
          {greyColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-24 rounded-lg border border-grey-200 flex items-center justify-center"
                style={{ backgroundColor: color.value }}
              >
                <span className={`text-xs ${color.text === 'light' ? 'text-white' : 'text-grey-900'}`}>
                  {color.name}
                </span>
              </div>
              <p className="text-xs text-grey-600 text-center">{color.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-info-50 rounded-lg">
          <p className="text-info-800 text-xs">
            <strong>Usage:</strong> Grey 50 for backgrounds, Grey 900 for primary text, 
            Grey 300 for borders, Grey 600 for secondary text
          </p>
        </div>
      </div>

      {/* Semantic Colors */}
      <div>
        <h2 className="mb-4">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {semanticColors.map((color) => (
            <div key={color.name} className="space-y-2">
              <div
                className="h-24 rounded-lg border border-grey-200 flex items-center justify-center"
                style={{ backgroundColor: color.value }}
              >
                <span className={`text-xs ${color.text === 'light' ? 'text-white' : 'text-grey-900'}`}>
                  {color.name}
                </span>
              </div>
              <p className="text-xs text-grey-600">{color.value}</p>
              <p className="text-xs text-grey-500">{color.usage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Elevation Examples */}
      <div>
        <h2 className="mb-4">Elevation Levels</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { level: 0, name: 'Flat' },
            { level: 2, name: 'Card' },
            { level: 8, name: 'Dropdown' },
            { level: 24, name: 'Modal' }
          ].map((elevation) => (
            <div key={elevation.level} className="space-y-2">
              <div
                className="h-24 bg-white rounded-lg flex items-center justify-center border border-grey-200"
                style={{ 
                  boxShadow: elevation.level === 0 ? 'none' : 
                    elevation.level === 2 ? 'var(--elevation-2)' :
                    elevation.level === 8 ? 'var(--elevation-8)' :
                    'var(--elevation-24)'
                }}
              >
                <div className="text-center">
                  <p className="text-grey-900">Elevation {elevation.level}</p>
                  <p className="text-grey-600 text-xs mt-1">{elevation.name}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography Scale */}
      <div>
        <h2 className="mb-4">Typography Scale</h2>
        <div className="bg-white rounded-xl border border-grey-200 p-6 space-y-4">
          <div className="border-b border-grey-200 pb-4">
            <p className="text-grey-600 text-xs mb-2">Display (57px / 64px)</p>
            <div style={{ fontSize: '57px', lineHeight: '64px' }}>Display Text</div>
          </div>
          <div className="border-b border-grey-200 pb-4">
            <p className="text-grey-600 text-xs mb-2">Headline (32px / 40px)</p>
            <h1>Headline Text</h1>
          </div>
          <div className="border-b border-grey-200 pb-4">
            <p className="text-grey-600 text-xs mb-2">Title (20px / 28px)</p>
            <h2>Title Text</h2>
          </div>
          <div className="border-b border-grey-200 pb-4">
            <p className="text-grey-600 text-xs mb-2">Body (14px / 20px)</p>
            <p>Body text for paragraphs and general content</p>
          </div>
          <div>
            <p className="text-grey-600 text-xs mb-2">Caption (12px / 16px)</p>
            <p className="text-xs">Caption text for helper information</p>
          </div>
        </div>
      </div>

      {/* Spacing System */}
      <div>
        <h2 className="mb-4">Spacing System (8px Grid)</h2>
        <div className="bg-white rounded-xl border border-grey-200 p-6 space-y-3">
          {[
            { name: 'XS', value: '4px', multiplier: '0.5 × 8' },
            { name: 'SM', value: '8px', multiplier: '1 × 8' },
            { name: 'MD', value: '16px', multiplier: '2 × 8' },
            { name: 'LG', value: '24px', multiplier: '3 × 8' },
            { name: 'XL', value: '32px', multiplier: '4 × 8' },
            { name: '2XL', value: '48px', multiplier: '6 × 8' },
            { name: '3XL', value: '64px', multiplier: '8 × 8' }
          ].map((spacing) => (
            <div key={spacing.name} className="flex items-center gap-4">
              <div className="w-16 text-grey-700">{spacing.name}</div>
              <div 
                className="bg-primary-500 h-8 rounded"
                style={{ width: spacing.value }}
              />
              <div className="text-grey-600 text-xs">
                {spacing.value} ({spacing.multiplier})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
