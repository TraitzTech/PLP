"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
  initialPassword?: string;
}

export default function PasswordGenerator({
  onPasswordGenerated,
  initialPassword = "",
}: PasswordGeneratorProps) {

  const [password, setPassword] = useState(initialPassword);
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const generatePassword = () => {
    let charset = "";
    let newPassword = "";

    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.numbers) charset += "0123456789";
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset === "") {
      toast.error("Please select at least one character type");
      return;
    }

    // Ensure at least one character from each selected type
    if (options.lowercase)
      newPassword += "abcdefghijklmnopqrstuvwxyz"[
        Math.floor(Math.random() * 26)
      ];
    if (options.uppercase)
      newPassword += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
        Math.floor(Math.random() * 26)
      ];
    if (options.numbers) newPassword += "0123456789"[Math.floor(Math.random() * 10)];
    if (options.symbols)
      newPassword += "!@#$%^&*()_+-=[]{}|;:,.<>?"[
        Math.floor(Math.random() * 25)
      ];

    // Fill remaining length with random characters
    for (let i = newPassword.length; i < length; i++) {
      newPassword += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    newPassword = newPassword
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    setPassword(newPassword);
    onPasswordGenerated(newPassword);
  };

  const copyToClipboard = async () => {
    if (!password) {
      toast.error("No password to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      toast.success("Password copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy password");
    };
  };

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Generator</CardTitle>
        <CardDescription>
          Generate a secure password with custom options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={password}
              readOnly
              placeholder="Generated password will appear here"
              className="font-mono"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!password}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={generatePassword}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Password Length: {length}</Label>
          </div>
          <Slider
            value={[length]}
            onValueChange={(value) => setLength(value[0])}
            min={8}
            max={32}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <Label>Character Types</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={() => handleOptionChange("uppercase")}
              />
              <label
                htmlFor="uppercase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Uppercase (A-Z)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={() => handleOptionChange("lowercase")}
              />
              <label
                htmlFor="lowercase"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lowercase (a-z)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={options.numbers}
                onCheckedChange={() => handleOptionChange("numbers")}
              />
              <label
                htmlFor="numbers"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Numbers (0-9)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={options.symbols}
                onCheckedChange={() => handleOptionChange("symbols")}
              />
              <label
                htmlFor="symbols"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Symbols (!@#$%...)
              </label>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={generatePassword}
          className="w-full"
          variant="secondary"
        >
          Generate Password
        </Button>
      </CardContent>
    </Card>
  );
}
