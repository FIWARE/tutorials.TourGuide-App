package org.fiware.devguideapp.utils.bigdata.mapreduce;

import org.fiware.devguideapp.utils.bigdata.mapreduce.reducers.AttrValuesJoiner;
import org.fiware.devguideapp.utils.bigdata.mapreduce.mappers.AttrValueEmitterJsonColumn;
import java.io.IOException;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.NullWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

/**
 *
 * @author frb
 */
public final class AttrStatsGetter extends Configured implements Tool {
    
    private static Configuration conf;
    private static FileSystem fs;
    private static String fsHost;
    private static String fsPort;
    private static Path baseInputFolder;
    private static Path baseOutputFolder;
    private static String fileFormat;

    /**
     * Main method.
     * @param args
     * @throws java.lang.Exception
     */
    public static void main(String[] args) throws Exception {
        int res = ToolRunner.run(new Configuration(), new AttrStatsGetter(), args);
        System.exit(res);
    } // main
    
    @Override
    public int run(String[] args) throws Exception {
        // Check the number of arguments, show the usage if it is wrong
        if (args.length != 5) {
            showUsage();
            return -1;
        } // if
        
        try {
            // Get the arguments
            fsHost = args[0];
            fsPort = args[1];
            baseInputFolder = new Path(args[2]);
            baseOutputFolder = new Path(args[3]);
            fileFormat = args[4];
            
            // Get a HDFS file system object
            conf = new Configuration();
            conf.set("fs.default.name", "hdfs://" + fsHost + ":" + fsPort);
            fs = FileSystem.get(conf);

            // Iterate the input folder
            return process(baseInputFolder);
        } catch (IOException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return 0;
        } // try catch // try catch // try catch // try catch
    } // run
    
    private void showUsage() {
        System.out.println("Usage:");
        System.out.println();
        System.out.println("hadoop jar \\");
        System.out.println("   target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar \\");
        System.out.println("   org.fiware.devguideapp.utils.bigdata.mapreduce.AttrStatsGetter \\");
        System.out.println("   -libjars target/generic-jobs-0.0.0-SNAPSHOT-jar-with-dependencies.jar \\");
        System.out.println("   <file system host> \\");
        System.out.println("   <file system port> \\");
        System.out.println("   <HDFS input> \\");
        System.out.println("   <HDFS output> \\");
        System.out.println("   <file format>");
    } // showUsage
    
    private static int process(Path baseInputFolderName) throws Exception {
        try {
            int res = 0;
            FileStatus[] fileStatus = fs.listStatus(baseInputFolderName);
            
            for (FileStatus fileStat : fileStatus) {
                if (fileStat.isDir()) {
                    res = process(fileStat.getPath());
                } else {
                    res = analyze(baseInputFolderName);
                } // if else
            } // for
            
            return res;
        } catch (IOException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return 1;
        } // try catch
    } // process
    
    private static int analyze(Path input) throws Exception {
        try {
            Job job = Job.getInstance(conf, "attr-stats-getter");
            job.setJarByClass(AttrStatsGetter.class);
            
            if (fileFormat.equals("json-row")) {
                throw new Exception("Not supported yet");
            } else if (fileFormat.equals("json-column")) {
                job.setMapperClass(AttrValueEmitterJsonColumn.class);
            } else if (fileFormat.equals("json-column")) {
                throw new Exception("Not supported yet");
            } else if (fileFormat.equals("json-column")) {
                throw new Exception("Not supported yet");
            } else {
                throw new Exception("Not supported yet");
            } // if else
            
            job.setReducerClass(AttrValuesJoiner.class);
            job.setMapOutputKeyClass(Text.class);
            job.setMapOutputValueClass(Text.class);
            job.setOutputKeyClass(NullWritable.class);
            job.setOutputValueClass(Text.class);
            FileInputFormat.addInputPath(job, input);
            FileOutputFormat.setOutputPath(job, new Path(baseOutputFolder.toString() + "/" + input.getName()));
            
            // run the MapReduce job
            return job.waitForCompletion(true) ? 0 : 1;
        } catch (IOException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return 1;
        } catch (InterruptedException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return 1;
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(AttrStatsGetter.class.getName()).log(Level.SEVERE, null, ex);
            return 1;
        } // try catch
    } // analyze
    
} // AttrStatsGetter
