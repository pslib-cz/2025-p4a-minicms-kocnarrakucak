"use client";

import { useState } from "react";
import { Button, Select, SelectItem, Textarea, Card, CardBody, CardHeader } from "@nextui-org/react";
import { FaStar, FaTrash } from "react-icons/fa";

type EvaluationFormProps = {
  promptId: string;
  models: any[];
  existingEvaluations: any[];
};

export function EvaluationForm({ promptId, models, existingEvaluations }: EvaluationFormProps) {
  const [evaluations, setEvaluations] = useState(existingEvaluations);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    aiModelId: "",
    rating: 3,
    comment: "",
  });

  const availableModels = models.filter(m => !evaluations.some(e => e.aiModelId === m.id));

  const handleAdd = async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/evaluations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newEval = await res.json();
        setEvaluations([...evaluations, newEval]);
        setIsAdding(false);
        setFormData({ aiModelId: "", rating: 3, comment: "" });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add evaluation");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (evalId: string) => {
    if (!confirm("Delete this evaluation?")) return;
    try {
      const res = await fetch(`/api/prompts/${promptId}/evaluations/${evalId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setEvaluations(evaluations.filter(e => e.id !== evalId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* List Existing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {evaluations.map((ev) => (
          <Card key={ev.id} className="relative overflow-visible border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <Button
              isIconOnly
              color="danger"
              variant="flat"
              size="sm"
              className="absolute -top-3 -right-3 z-10 rounded-full"
              onClick={() => handleDelete(ev.id)}
            >
              <FaTrash size={12} />
            </Button>
            <CardHeader className="flex justify-between items-start pb-0 pt-4 px-4">
              <div>
                <h3 className="text-lg font-bold">{ev.aiModel.name}</h3>
                <p className="text-xs text-zinc-500">{ev.aiModel.provider}</p>
              </div>
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < ev.rating ? "" : "text-zinc-300 dark:text-zinc-700"} />
                ))}
              </div>
            </CardHeader>
            <CardBody className="px-4 py-4 space-y-4">
              {ev.comment && <p className="text-sm italic text-zinc-600 dark:text-zinc-400">"{ev.comment}"</p>}
              
              {ev.outputText && (
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 text-sm whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                  {ev.outputText}
                </div>
              )}
              
              {ev.outputImageUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img src={ev.outputImageUrl} alt="Model output" className="w-full h-auto object-cover" />
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {!isAdding && availableModels.length > 0 && (
        <Button variant="flat" color="primary" onClick={() => setIsAdding(true)}>
          Add Model Evaluation
        </Button>
      )}

      {isAdding && (
        <Card className="bg-zinc-50 dark:bg-zinc-900 border border-blue-200 dark:border-blue-900/30">
          <CardBody className="space-y-4 p-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">New Evaluation</h3>
              <Button size="sm" variant="light" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
            
            <Select 
              label="Select AI Model" 
              selectedKeys={[formData.aiModelId]}
              onChange={(e) => setFormData({...formData, aiModelId: e.target.value})}
            >
              {availableModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </Select>
            
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData({...formData, rating: val})}
                    className={`text-2xl transition-colors ${val <= formData.rating ? 'text-yellow-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-yellow-200'}`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Comment / Thoughts"
              placeholder="How well did this model handle the prompt?"
              value={formData.comment}
              onValueChange={(val) => setFormData({...formData, comment: val})}
            />

            <div className="flex justify-end pt-2">
              <Button color="primary" onClick={handleAdd} isDisabled={!formData.aiModelId}>
                Save Evaluation
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
