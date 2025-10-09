import React, { useState } from 'react';
import { AreaShape, MaskType } from '@prisma/client';
import { 
  Circle, 
  Square, 
  Triangle, 
  Star, 
  Heart, 
  Diamond,
  Hexagon,
  Move,
  RotateCw,
  Save,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import ShapeMask from '@/components/ShapeMask';

// Componente simple de tooltip
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative group inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 whitespace-nowrap">
      {text}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
);

interface AreaShapeEditorProps {
  area?: {
    id?: string;
    name: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    shape: AreaShape;
    maskType: MaskType;
    maskData?: string | null;
    cornerRadius?: number | null;
    rotation: number;
    allowText: boolean;
    allowImages: boolean;
    extraCost: number;
  };
  onSave: (area: any) => void;
  onCancel: () => void;
}

const AreaShapeEditor: React.FC<AreaShapeEditorProps> = ({
  area,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: area?.name || '',
    xPercent: area?.xPercent || 50,
    yPercent: area?.yPercent || 50,
    widthPercent: area?.widthPercent || 20,
    heightPercent: area?.heightPercent || 20,
    shape: area?.shape || 'RECTANGLE' as AreaShape,
    maskType: area?.maskType || 'CLIP_PATH' as MaskType,
    maskData: area?.maskData || '',
    cornerRadius: area?.cornerRadius || 0,
    rotation: area?.rotation || 0,
    allowText: area?.allowText ?? true,
    allowImages: area?.allowImages ?? true,
    extraCost: area?.extraCost || 0
  });

  const shapes = [
    { value: 'RECTANGLE', label: 'Rectángulo', icon: Square },
    { value: 'CIRCLE', label: 'Círculo', icon: Circle },
    { value: 'ELLIPSE', label: 'Elipse', icon: Circle },
    { value: 'TRIANGLE', label: 'Triángulo', icon: Triangle },
    { value: 'HEXAGON', label: 'Hexágono', icon: Hexagon },
    { value: 'STAR', label: 'Estrella', icon: Star },
    { value: 'HEART', label: 'Corazón', icon: Heart },
    { value: 'DIAMOND', label: 'Diamante', icon: Diamond },
    { value: 'CUSTOM', label: 'Personalizado', icon: Square }
  ];

  const maskTypes = [
    { value: 'NONE', label: 'Sin máscara' },
    { value: 'CLIP_PATH', label: 'CSS Clip Path' },
    { value: 'SVG_MASK', label: 'Máscara SVG' },
    { value: 'CANVAS_MASK', label: 'Máscara Canvas' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const presetShapes = {
    HEART: "M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5 C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z",
    STAR: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    DIAMOND: "M6,2L18,2L22,8L18,14L6,14L2,8L6,2Z"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-6">
          {area?.id ? 'Editar Área' : 'Nueva Área de Personalización'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración Básica */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuración Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Área</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Ej: Pecho, Espalda, Logo"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Label htmlFor="extraCost">Coste Extra (€)</Label>
                      <Tooltip text="Coste adicional que se añade al precio base cuando el cliente personaliza en esta área">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="extraCost"
                      type="number"
                      step="0.01"
                      value={formData.extraCost}
                      onChange={(e) => updateField('extraCost', parseFloat(e.target.value) || 0)}
                      placeholder="Ej: 2.50"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      <Label htmlFor="rotation">Rotación (grados)</Label>
                      <Tooltip text="Grados de rotación del área (0° = sin rotación, valores positivos = rotación horaria)">
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </Tooltip>
                    </div>
                    <Input
                      id="rotation"
                      type="number"
                      value={formData.rotation}
                      onChange={(e) => updateField('rotation', parseInt(e.target.value) || 0)}
                      placeholder="Ej: 0"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allowText}
                        onChange={(e) => updateField('allowText', e.target.checked)}
                        className="mr-2"
                      />
                      Permitir Texto
                    </label>
                    <Tooltip text="Los usuarios podrán añadir texto personalizado en esta área">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.allowImages}
                        onChange={(e) => updateField('allowImages', e.target.checked)}
                        className="mr-2"
                      />
                      Permitir Imágenes
                    </label>
                    <Tooltip text="Los usuarios podrán subir y colocar imágenes personalizadas en esta área">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma y Máscara */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Forma y Máscara</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Forma del Área</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {shapes.map((shape) => {
                      const IconComponent = shape.icon;
                      return (
                        <button
                          key={shape.value}
                          type="button"
                          onClick={() => updateField('shape', shape.value)}
                          className={`p-3 border rounded-lg flex flex-col items-center gap-1 transition-colors ${
                            formData.shape === shape.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span className="text-xs">{shape.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label htmlFor="maskType">Tipo de Máscara</Label>
                  <select
                    id="maskType"
                    value={formData.maskType}
                    onChange={(e) => updateField('maskType', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    {maskTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.shape === 'RECTANGLE' && (
                  <div>
                    <Label htmlFor="cornerRadius">Radio de Esquinas</Label>
                    <Input
                      id="cornerRadius"
                      type="number"
                      value={formData.cornerRadius || 0}
                      onChange={(e) => updateField('cornerRadius', parseInt(e.target.value) || 0)}
                    />
                  </div>
                )}

                {formData.shape === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="maskData">Datos SVG Path</Label>
                    <textarea
                      id="maskData"
                      value={formData.maskData}
                      onChange={(e) => updateField('maskData', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded h-20"
                      placeholder="Introduce el path SVG personalizado..."
                    />
                    <div className="mt-2 text-xs text-gray-600">
                      <p>Formas predefinidas:</p>
                      <div className="flex gap-2 mt-1">
                        {Object.entries(presetShapes).map(([name, path]) => (
                          <Button
                            key={name}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => updateField('maskData', path)}
                          >
                            {name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Posición y Tamaño */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Posición y Tamaño (en porcentajes)</CardTitle>
                <Tooltip text="Usa porcentajes para que el área se adapte automáticamente al tamaño de la imagen del mockup">
                  <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="xPercent">Posición X (%)</Label>
                    <Tooltip text="Posición horizontal desde el borde izquierdo (0% = izquierda, 50% = centro, 100% = derecha)">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    id="xPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.xPercent}
                    onChange={(e) => updateField('xPercent', parseFloat(e.target.value) || 0)}
                    placeholder="Ej: 35"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="yPercent">Posición Y (%)</Label>
                    <Tooltip text="Posición vertical desde el borde superior (0% = arriba, 50% = centro, 100% = abajo)">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    id="yPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.yPercent}
                    onChange={(e) => updateField('yPercent', parseFloat(e.target.value) || 0)}
                    placeholder="Ej: 30"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="widthPercent">Ancho (%)</Label>
                    <Tooltip text="Ancho del área como porcentaje del ancho total de la imagen (Ej: 25% = un cuarto del ancho)">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    id="widthPercent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.widthPercent}
                    onChange={(e) => updateField('widthPercent', parseFloat(e.target.value) || 1)}
                    placeholder="Ej: 25"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Label htmlFor="heightPercent">Alto (%)</Label>
                    <Tooltip text="Alto del área como porcentaje del alto total de la imagen (Ej: 15% = un sexto del alto)">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <Input
                    id="heightPercent"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.heightPercent}
                    onChange={(e) => updateField('heightPercent', parseFloat(e.target.value) || 1)}
                    placeholder="Ej: 15"
                  />
                </div>
              </div>
              
              {/* Ejemplos Comunes */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Ejemplos Comunes:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-blue-700">
                  <div>
                    <strong>Pecho de Camiseta:</strong><br/>
                    X: 35%, Y: 30%, W: 25%, H: 15%
                  </div>
                  <div>
                    <strong>Espalda Completa:</strong><br/>
                    X: 15%, Y: 20%, W: 70%, H: 60%
                  </div>
                  <div>
                    <strong>Visera de Gorra:</strong><br/>
                    X: 30%, Y: 40%, W: 40%, H: 15%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-gray-100 rounded relative border">
                <div
                  className="absolute border-2 border-blue-500"
                  style={{
                    left: `${formData.xPercent}%`,
                    top: `${formData.yPercent}%`,
                    width: `${formData.widthPercent}%`,
                    height: `${formData.heightPercent}%`,
                    transform: `translate(-50%, -50%) rotate(${formData.rotation}deg)`
                  }}
                >
                  <ShapeMask
                    shape={formData.shape}
                    maskType={formData.maskType}
                    maskData={formData.maskData}
                    cornerRadius={formData.cornerRadius}
                    className="w-full h-full"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center">
                      <span className="text-xs text-blue-800 font-medium">
                        {formData.name || 'Área'}
                      </span>
                    </div>
                  </ShapeMask>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Vista previa del área con forma {formData.shape.toLowerCase()} y máscara {formData.maskType.toLowerCase()}
              </p>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {area?.id ? 'Actualizar Área' : 'Crear Área'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AreaShapeEditor;