import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Video, FileText, Trash2, Edit3, ExternalLink, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { getMaterials, addMaterial } from '@/services/dataService';
import { Material } from '@/types';

export function ManageMaterials() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedGen, setSelectedGen] = useState(() => localStorage.getItem('admin_selected_gen') || 'all');
  
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'video' as 'video' | 'slide',
    gen: selectedGen === 'all' ? 'GEN30' : selectedGen,
    url: '',
    topic: '',
    week: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNewMaterial(prev => ({ ...prev, gen: selectedGen === 'all' ? 'GEN30' : selectedGen }));
  }, [selectedGen]);

  const handleUpload = async () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error("Title and URL are required");
      return;
    }
    setIsSaving(true);
    try {
      await addMaterial(newMaterial as any);
      toast.success("Material uploaded!");
      setIsAddOpen(false);
      // Refresh
      const genFilter = selectedGen === 'all' ? undefined : selectedGen;
      const data = await getMaterials(genFilter);
      setMaterials(data);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const genFilter = selectedGen === 'all' ? undefined : selectedGen;
        const data = await getMaterials(genFilter);
        setMaterials(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedGen]);

  const handleDelete = (id: string) => {
    // Simulated delete
    setMaterials(materials.filter(m => m.id !== id));
    toast.error("Material deleted");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Filtering Archives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input placeholder="Search materials..." className="pl-10 h-12 rounded-xl border-slate-200 bg-white" />
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold h-12 rounded-xl px-6">
              <Plus className="w-5 h-5 mr-2" /> Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-3xl p-8 border-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase italic">Upload New Material</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">Add learning resources for your cohorts.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2 col-span-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Title</Label>
                <Input 
                  placeholder="Introduction to Express" 
                  className="h-12 rounded-xl bg-slate-50 border-0" 
                  value={newMaterial.title}
                  onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Type</Label>
                <Select value={newMaterial.type} onValueChange={(v: any) => setNewMaterial({...newMaterial, type: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-0">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="slide">Slide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-slate-500">Cohort (GEN)</Label>
                <select 
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 border-0 text-sm font-medium"
                  value={newMaterial.gen}
                  onChange={(e) => setNewMaterial({...newMaterial, gen: e.target.value})}
                >
                   <option value="all">All Cohorts</option>
                   <option value="GEN30">GEN 30</option>
                   <option value="GEN31">GEN 31</option>
                   <option value="GEN32">GEN 32</option>
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="font-bold text-xs uppercase text-slate-500">URL</Label>
                <Input 
                  placeholder="https://youtube.com/..." 
                  className="h-12 rounded-xl bg-slate-50 border-0" 
                  value={newMaterial.url}
                  onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter className="pt-8">
              <Button 
                onClick={handleUpload} 
                disabled={isSaving}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-black uppercase"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : "Save Material"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-slate-400 uppercase text-xs pl-8">Material</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-xs">Type</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-xs">Cohort</TableHead>
              <TableHead className="font-bold text-slate-400 uppercase text-xs">Topic</TableHead>
              <TableHead className="text-right font-bold text-slate-400 uppercase text-xs pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((m) => (
              <TableRow key={m.id} className="hover:bg-slate-50 transition-colors border-slate-100">
                <TableCell className="font-bold text-slate-900 pl-8">{m.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {m.type === 'video' ? <Video className="w-4 h-4 text-red-500" /> : <FileText className="w-4 h-4 text-blue-500" />}
                    <span className="capitalize text-sm font-medium text-slate-600">{m.type}</span>
                  </div>
                </TableCell>
                <TableCell className="font-black text-indigo-600 text-xs">{m.gen}</TableCell>
                <TableCell className="text-slate-500 font-medium text-sm">{m.topic}</TableCell>
                <TableCell className="text-right pr-8">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                      <Edit3 size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
