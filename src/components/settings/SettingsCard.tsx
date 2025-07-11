
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SettingsCard = ({ title, description, children }: SettingsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
};

interface SettingFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea';
  placeholder?: string;
  description?: string;
}

export const SettingField = ({ 
  label, 
  value, 
  onChange, 
  onSave, 
  type = 'text', 
  placeholder,
  description 
}: SettingFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '_')}>{label}</Label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="flex gap-2">
        {type === 'textarea' ? (
          <Textarea
            id={label.toLowerCase().replace(/\s+/g, '_')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        ) : (
          <Input
            id={label.toLowerCase().replace(/\s+/g, '_')}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
        )}
        <Button onClick={onSave} size="sm">
          Salvar
        </Button>
      </div>
    </div>
  );
};

interface SettingSwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  onSave: () => void;
}

export const SettingSwitch = ({ 
  label, 
  description, 
  checked, 
  onChange, 
  onSave 
}: SettingSwitchProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-1">
        <Label className="text-base font-medium">{label}</Label>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={checked}
          onCheckedChange={onChange}
        />
        <Button onClick={onSave} size="sm" variant="outline">
          Salvar
        </Button>
      </div>
    </div>
  );
};
