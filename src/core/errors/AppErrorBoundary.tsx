import { Component, type ReactNode, type ErrorInfo } from 'react';
import { errorLogService } from '../../services/errorLogService';
export class AppErrorBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(error:Error,info:ErrorInfo){errorLogService.record(new Error(`${error.message}\n${info.componentStack??''}`,{cause:error}));}
  render(){return this.state.failed?<main className="mx-auto max-w-xl space-y-5 p-8"><h1 className="text-2xl font-semibold">TindaPOS could not display this screen</h1><p>Your saved browser records have not been reset.</p><button className="btn-primary" onClick={()=>location.reload()}>Reload app</button></main>:this.props.children;}
}
